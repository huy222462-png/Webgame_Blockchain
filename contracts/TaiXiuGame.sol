// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaiXiuGame
 * @dev Smart contract cho game Tài Xỉu (Over/Under) với betting on-chain
 */
contract TaiXiuGame is ReentrancyGuard, Ownable {
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public constant HOUSE_EDGE = 2; // 2% house edge
    
    uint256 public gameCounter;
    uint256 public totalBetsPlaced;
    uint256 public totalVolume;
    
    enum BetType { TAI, XIU }
    enum GameStatus { OPEN, ROLLING, CLOSED }
    
    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint256 timestamp;
    }
    
    struct Game {
        uint256 gameId;
        GameStatus status;
        uint256 totalTaiBets;
        uint256 totalXiuBets;
        uint256 dice1;
        uint256 dice2;
        uint256 dice3;
        uint256 totalDice;
        uint256 timestamp;
        bool resolved;
    }
    
    mapping(uint256 => Game) public games;
    mapping(uint256 => Bet[]) public gameBets;
    mapping(address => uint256) public playerWinnings;
    mapping(address => uint256) public playerTotalBets;
    
    event GameCreated(uint256 indexed gameId, uint256 timestamp);
    event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount, BetType betType);
    event GameResolved(uint256 indexed gameId, uint256 dice1, uint256 dice2, uint256 dice3, uint256 total, bool isTai);
    event WinningsPaid(address indexed player, uint256 amount);
    event Withdrawal(address indexed player, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        createNewGame();
    }
    
    /**
     * @dev Tạo game mới
     */
    function createNewGame() public onlyOwner returns (uint256) {
        gameCounter++;
        games[gameCounter] = Game({
            gameId: gameCounter,
            status: GameStatus.OPEN,
            totalTaiBets: 0,
            totalXiuBets: 0,
            dice1: 0,
            dice2: 0,
            dice3: 0,
            totalDice: 0,
            timestamp: block.timestamp,
            resolved: false
        });
        
        emit GameCreated(gameCounter, block.timestamp);
        return gameCounter;
    }
    
    /**
     * @dev Đặt cược cho game hiện tại
     */
    function placeBet(BetType _betType) external payable nonReentrant {
        require(msg.value >= MIN_BET, "Bet amount too low");
        require(msg.value <= MAX_BET, "Bet amount too high");
        
        Game storage game = games[gameCounter];
        require(game.status == GameStatus.OPEN, "Game not accepting bets");
        
        if (_betType == BetType.TAI) {
            game.totalTaiBets += msg.value;
        } else {
            game.totalXiuBets += msg.value;
        }
        
        gameBets[gameCounter].push(Bet({
            player: msg.sender,
            amount: msg.value,
            betType: _betType,
            timestamp: block.timestamp
        }));
        
        playerTotalBets[msg.sender] += msg.value;
        totalBetsPlaced++;
        totalVolume += msg.value;
        
        emit BetPlaced(gameCounter, msg.sender, msg.value, _betType);
    }
    
    /**
     * @dev Lắc xúc xắc và giải quyết game (chỉ owner)
     * @notice Trong production, nên dùng Chainlink VRF cho random an toàn hơn
     */
    function rollDice() external onlyOwner {
        Game storage game = games[gameCounter];
        require(game.status == GameStatus.OPEN, "Game not open");
        require(gameBets[gameCounter].length > 0, "No bets placed");
        
        game.status = GameStatus.ROLLING;
        
        // Simple pseudo-random (NOT SECURE - use Chainlink VRF in production)
        game.dice1 = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, 1))) % 6) + 1;
        game.dice2 = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, 2))) % 6) + 1;
        game.dice3 = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, 3))) % 6) + 1;
        game.totalDice = game.dice1 + game.dice2 + game.dice3;
        
        resolveGame();
    }
    
    /**
     * @dev Giải quyết kết quả game và phân phối thắng
     */
    function resolveGame() internal {
        Game storage game = games[gameCounter];
        bool isTai = game.totalDice >= 11; // 11-18 is Tai, 3-10 is Xiu
        
        Bet[] storage bets = gameBets[gameCounter];
        uint256 totalWinningBets = isTai ? game.totalTaiBets : game.totalXiuBets;
        uint256 totalLosingBets = isTai ? game.totalXiuBets : game.totalTaiBets;
        
        // Calculate house edge
        uint256 houseCommission = (totalLosingBets * HOUSE_EDGE) / 100;
        uint256 prizePool = totalLosingBets - houseCommission;
        
        // Distribute winnings
        for (uint256 i = 0; i < bets.length; i++) {
            Bet storage bet = bets[i];
            bool isWinner = (isTai && bet.betType == BetType.TAI) || (!isTai && bet.betType == BetType.XIU);
            
            if (isWinner && totalWinningBets > 0) {
                uint256 share = (bet.amount * prizePool) / totalWinningBets;
                uint256 payout = bet.amount + share;
                playerWinnings[bet.player] += payout;
                emit WinningsPaid(bet.player, payout);
            }
        }
        
        game.status = GameStatus.CLOSED;
        game.resolved = true;
        
        emit GameResolved(gameCounter, game.dice1, game.dice2, game.dice3, game.totalDice, isTai);
        
        // Create new game for next round
        createNewGame();
    }
    
    /**
     * @dev Người chơi rút tiền thắng
     */
    function withdraw() external nonReentrant {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings to withdraw");
        
        playerWinnings[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Lấy thông tin game hiện tại
     */
    function getCurrentGame() external view returns (Game memory) {
        return games[gameCounter];
    }
    
    /**
     * @dev Lấy tất cả bets của một game
     */
    function getGameBets(uint256 _gameId) external view returns (Bet[] memory) {
        return gameBets[_gameId];
    }
    
    /**
     * @dev Lấy số tiền có thể rút của người chơi
     */
    function getPlayerBalance(address _player) external view returns (uint256) {
        return playerWinnings[_player];
    }
    
    /**
     * @dev Owner rút house commission
     */
    function withdrawHouseBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Nhận ETH trực tiếp vào contract
     */
    receive() external payable {}
}
