// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Bomdog Clicker Game (Polygon testnet)
/// @notice Lưu dữ liệu người chơi on-chain, không dùng token thật
contract BomdogGame {
    struct Player {
        uint256 level;        // Level người chơi
        uint256 clickPower;   // Coin nhận được mỗi lần click
        uint256 idleIncome;   // Coin nhận được mỗi giờ (coin/hour)
        uint256 totalCoins;   // Tổng coin đã tích luỹ (đã claim)
        uint256 lastClaim;    // Thời điểm cuối cùng claim idle (timestamp)
    }

    /// @notice Mỗi ví = 1 tài khoản game
    mapping(address => Player) public players;

    // Sự kiện để frontend listen nếu muốn
    event PlayerRegistered(address indexed player);
    event ClickEarned(address indexed player, uint256 amount, uint256 newTotal);
    event IdleClaimed(address indexed player, uint256 amount, uint256 newTotal);
    event ClickUpgraded(address indexed player, uint256 newClickPower, uint256 newLevel);
    event IdleUpgraded(address indexed player, uint256 newIdleIncome, uint256 newLevel);

    /// @notice Đăng ký tài khoản game cho ví gọi hàm
    function registerPlayer() external {
        Player storage p = players[msg.sender];
        require(
            p.level == 0 &&
                p.clickPower == 0 &&
                p.idleIncome == 0 &&
                p.totalCoins == 0 &&
                p.lastClaim == 0,
            "Already registered"
        );

        // Giá trị khởi tạo cơ bản
        p.level = 1;
        p.clickPower = 1; // 1 coin / click
        p.idleIncome = 10; // 10 coin / giờ
        p.totalCoins = 0;
        p.lastClaim = block.timestamp;

        emit PlayerRegistered(msg.sender);
    }

    /// @notice Gọi khi người chơi click vào Bomdog
    function earnClick() external {
        Player storage p = players[msg.sender];
        require(p.level > 0, "Not registered");

        p.totalCoins += p.clickPower;

        emit ClickEarned(msg.sender, p.clickPower, p.totalCoins);
    }

    /// @notice Claim coin thụ động (idle) dựa trên thời gian đã trôi qua
    function claimIdle() external {
        Player storage p = players[msg.sender];
        require(p.level > 0, "Not registered");

        uint256 elapsed = block.timestamp - p.lastClaim;
        require(elapsed > 0, "Nothing to claim");

        // idleIncome là coin / giờ
        uint256 reward = (elapsed * p.idleIncome) / 3600;
        require(reward > 0, "Too soon to claim");

        p.totalCoins += reward;
        p.lastClaim = block.timestamp;

        emit IdleClaimed(msg.sender, reward, p.totalCoins);
    }

    /// @notice Nâng cấp clickPower, tốn coin
    /// @dev Ví dụ: cost = (clickPower hiện tại + 1) * 100
    function upgradeClick() external {
        Player storage p = players[msg.sender];
        require(p.level > 0, "Not registered");

        uint256 nextPower = p.clickPower + 1;
        uint256 cost = nextPower * 100; // có thể chỉnh lại tuỳ balancing

        require(p.totalCoins >= cost, "Not enough coins");

        p.totalCoins -= cost;
        p.clickPower = nextPower;
        p.level += 1;

        emit ClickUpgraded(msg.sender, p.clickPower, p.level);
    }

    /// @notice Nâng cấp idleIncome, tốn coin
    /// @dev Ví dụ: cost = (idleIncome hiện tại + 10) * 200
    function upgradeIdle() external {
        Player storage p = players[msg.sender];
        require(p.level > 0, "Not registered");

        uint256 nextIdle = p.idleIncome + 10;
        uint256 cost = nextIdle * 200; // có thể chỉnh lại tuỳ balancing

        require(p.totalCoins >= cost, "Not enough coins");

        p.totalCoins -= cost;
        p.idleIncome = nextIdle;
        p.level += 1;

        emit IdleUpgraded(msg.sender, p.idleIncome, p.level);
    }

    /// @notice Lấy thông tin người chơi
    function getPlayer(
        address _player
    )
        external
        view
        returns (
            uint256 level,
            uint256 clickPower,
            uint256 idleIncome,
            uint256 totalCoins,
            uint256 lastClaim
        )
    {
        Player memory p = players[_player];
        return (p.level, p.clickPower, p.idleIncome, p.totalCoins, p.lastClaim);
    }
}


