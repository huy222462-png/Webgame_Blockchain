// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Bomdog Token - ERC20 Token cho game
/// @notice Token có thể mint thêm, dùng để withdraw cho người chơi
contract BomdogToken is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @param initialSupply Số lượng token ban đầu (đã tính decimals)
     * @param tokenDecimals Số chữ số thập phân (18 = standard, 2 = như tiền tệ)
     */
    constructor(
        uint256 initialSupply,
        uint8 tokenDecimals
    ) ERC20("Bomdog Coin", "BOMDOG") Ownable(msg.sender) {
        _decimals = tokenDecimals;
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Override decimals để có thể custom
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint thêm token - chỉ owner mới được gọi
     * @param to Địa chỉ nhận token
     * @param amount Số lượng token (đã tính decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn token - chỉ owner mới được gọi
     * @param amount Số lượng token cần burn
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}
