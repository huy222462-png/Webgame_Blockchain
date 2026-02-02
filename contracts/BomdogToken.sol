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

    /**
     * @notice Withdraw token cho user - chỉ owner mới được gọi
     * @dev Hàm này được backend gọi khi admin duyệt withdraw request
     * @param to Địa chỉ ví nhận token
     * @param amount Số lượng token (đã tính decimals)
     */
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        _transfer(address(this), to, amount);
    }

    /**
     * @notice Withdraw token cho chính người gọi - version đơn giản hơn
     * @param amount Số lượng token cần withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        _transfer(address(this), msg.sender, amount);
    }

    /**
     * @notice Owner nạp token vào contract để phục vụ withdraw
     * @param amount Số lượng token
     */
    function fundContract(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _transfer(msg.sender, address(this), amount);
    }

    /**
     * @notice Xem số dư token trong contract
     */
    function contractBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }
}
