// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FishingGame
 * @dev Smart contract cho game câu cá với reward system
 */
contract FishingGame is ReentrancyGuard, Ownable {
    uint256 public constant ENTRY_FEE = 0.001 ether;
    uint256 public constant FISH_CATCH_REWARD = 0.0005 ether;
    uint256 public constant RARE_FISH_REWARD = 0.005 ether;
    uint256 public constant JACKPOT_CHANCE = 100; // 1% chance
    
    uint256 public sessionCounter;
    uint256 public totalSessions;
    uint256 public jackpotPool;
    
    enum FishType { SMALL, MEDIUM, LARGE, RARE, JACKPOT }
    
    struct FishingSession {
        address player;
        uint256 sessionId;
        uint256 fishCaught;
        uint256 rareFishCaught;
        uint256 totalEarned;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    struct Fish {
        FishType fishType;
        uint256 reward;
        uint256 timestamp;
    }
    
    mapping(address => FishingSession) public activeSessions;
    mapping(address => uint256) public playerEarnings;
    mapping(address => uint256) public playerTotalCatches;
    mapping(address => Fish[]) public playerCatchHistory;
    
    // Leaderboard
    address[] public topPlayers;
    mapping(address => uint256) public leaderboardScores;
    
    event SessionStarted(address indexed player, uint256 sessionId, uint256 timestamp);
    event FishCaught(address indexed player, FishType fishType, uint256 reward);
    event SessionEnded(address indexed player, uint256 fishCaught, uint256 totalEarned);
    event JackpotWon(address indexed player, uint256 amount);
    event RewardClaimed(address indexed player, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Bắt đầu session câu cá mới
     */
    function startSession() external payable nonReentrant {
        require(msg.value >= ENTRY_FEE, "Insufficient entry fee");
        require(!activeSessions[msg.sender].active, "Session already active");
        
        // Add entry fee to jackpot pool
        jackpotPool += msg.value;
        
        sessionCounter++;
        activeSessions[msg.sender] = FishingSession({
            player: msg.sender,
            sessionId: sessionCounter,
            fishCaught: 0,
            rareFishCaught: 0,
            totalEarned: 0,
            startTime: block.timestamp,
            endTime: 0,
            active: true
        });
        
        totalSessions++;
        
        emit SessionStarted(msg.sender, sessionCounter, block.timestamp);
    }
    
    /**
     * @dev Câu cá trong session
     */
    function catchFish() external nonReentrant {
        FishingSession storage session = activeSessions[msg.sender];
        require(session.active, "No active session");
        
        // Simple random fish type (use Chainlink VRF in production)
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            block.prevrandao, 
            msg.sender,
            session.fishCaught
        ))) % 1000;
        
        FishType caughtFish;
        uint256 reward;
        
        // Determine fish type and reward
        if (randomNum < 10) { // 1% chance
            // Check jackpot
            if (randomNum < JACKPOT_CHANCE / 10) {
                caughtFish = FishType.JACKPOT;
                reward = jackpotPool / 2; // Win 50% of jackpot pool
                jackpotPool -= reward;
                emit JackpotWon(msg.sender, reward);
            } else {
                caughtFish = FishType.RARE;
                reward = RARE_FISH_REWARD;
                session.rareFishCaught++;
            }
        } else if (randomNum < 100) { // 9% chance
            caughtFish = FishType.LARGE;
            reward = FISH_CATCH_REWARD * 2;
        } else if (randomNum < 400) { // 30% chance
            caughtFish = FishType.MEDIUM;
            reward = FISH_CATCH_REWARD;
        } else { // 60% chance
            caughtFish = FishType.SMALL;
            reward = FISH_CATCH_REWARD / 2;
        }
        
        session.fishCaught++;
        session.totalEarned += reward;
        playerEarnings[msg.sender] += reward;
        playerTotalCatches[msg.sender]++;
        
        // Update leaderboard score
        leaderboardScores[msg.sender] += reward;
        updateLeaderboard(msg.sender);
        
        // Record catch history
        playerCatchHistory[msg.sender].push(Fish({
            fishType: caughtFish,
            reward: reward,
            timestamp: block.timestamp
        }));
        
        emit FishCaught(msg.sender, caughtFish, reward);
    }
    
    /**
     * @dev Kết thúc session
     */
    function endSession() external nonReentrant {
        FishingSession storage session = activeSessions[msg.sender];
        require(session.active, "No active session");
        
        session.active = false;
        session.endTime = block.timestamp;
        
        emit SessionEnded(msg.sender, session.fishCaught, session.totalEarned);
    }
    
    /**
     * @dev Rút tiền thưởng
     */
    function claimRewards() external nonReentrant {
        uint256 amount = playerEarnings[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        playerEarnings[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Update leaderboard
     */
    function updateLeaderboard(address player) internal {
        bool playerExists = false;
        for (uint256 i = 0; i < topPlayers.length; i++) {
            if (topPlayers[i] == player) {
                playerExists = true;
                break;
            }
        }
        
        if (!playerExists && topPlayers.length < 10) {
            topPlayers.push(player);
        }
        
        // Sort top 10 players by score (simple bubble sort for small array)
        for (uint256 i = 0; i < topPlayers.length; i++) {
            for (uint256 j = i + 1; j < topPlayers.length; j++) {
                if (leaderboardScores[topPlayers[j]] > leaderboardScores[topPlayers[i]]) {
                    address temp = topPlayers[i];
                    topPlayers[i] = topPlayers[j];
                    topPlayers[j] = temp;
                }
            }
        }
        
        // Keep only top 10
        if (topPlayers.length > 10) {
            topPlayers.pop();
        }
    }
    
    /**
     * @dev Lấy thông tin session hiện tại
     */
    function getActiveSession(address player) external view returns (FishingSession memory) {
        return activeSessions[player];
    }
    
    /**
     * @dev Lấy lịch sử câu cá
     */
    function getCatchHistory(address player) external view returns (Fish[] memory) {
        return playerCatchHistory[player];
    }
    
    /**
     * @dev Lấy top 10 leaderboard
     */
    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        uint256 length = topPlayers.length < 10 ? topPlayers.length : 10;
        address[] memory players = new address[](length);
        uint256[] memory scores = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            players[i] = topPlayers[i];
            scores[i] = leaderboardScores[topPlayers[i]];
        }
        
        return (players, scores);
    }
    
    /**
     * @dev Owner nạp tiền vào contract cho rewards
     */
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");
    }
    
    /**
     * @dev Owner rút tiền dư trong contract
     */
    function withdrawExcess() external onlyOwner {
        uint256 excessBalance = address(this).balance - jackpotPool;
        require(excessBalance > 0, "No excess balance");
        
        (bool success, ) = owner().call{value: excessBalance}("");
        require(success, "Transfer failed");
    }
    
    receive() external payable {}
}
