// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContractFactory
 * @notice Factory contract để deploy contracts mới on-chain
 * @dev Minh họa cách tạo contract từ contract khác
 */
contract ContractFactory is Ownable {
    
    // Lưu lịch sử các contract đã tạo
    address[] public deployedContracts;
    mapping(address => bool) public isDeployed;
    
    event ContractDeployed(
        address indexed contractAddress,
        address indexed deployer,
        string contractType
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Deploy một SimpleGame contract mới
     * @return Địa chỉ contract vừa tạo
     */
    function deploySimpleGame() external returns (address) {
        SimpleGame newGame = new SimpleGame(msg.sender);
        address gameAddress = address(newGame);
        
        deployedContracts.push(gameAddress);
        isDeployed[gameAddress] = true;
        
        emit ContractDeployed(gameAddress, msg.sender, "SimpleGame");
        return gameAddress;
    }
    
    /**
     * @notice Lấy danh sách tất cả contracts đã deploy
     */
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
    
    /**
     * @notice Đếm số lượng contracts đã deploy
     */
    function getContractCount() external view returns (uint256) {
        return deployedContracts.length;
    }
}

/**
 * @title SimpleGame
 * @notice Game contract đơn giản được tạo bởi Factory
 */
contract SimpleGame {
    address public owner;
    uint256 public score;
    
    event ScoreUpdated(uint256 newScore);
    
    constructor(address _owner) {
        owner = _owner;
        score = 0;
    }
    
    function incrementScore(uint256 points) external {
        require(msg.sender == owner, "Only owner");
        score += points;
        emit ScoreUpdated(score);
    }
}
