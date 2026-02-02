#!/usr/bin/env node

/**
 * CLI Tool để sinh Smart Contract tự động
 * Chạy: node scripts/generate-contract.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Templates
const templates = {
  erc20: (name, symbol, decimals) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ${name} Token
/// @notice ERC20 Token được tạo tự động
contract ${name}Token is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        uint256 initialSupply,
        uint8 tokenDecimals
    ) ERC20("${name}", "${symbol}") Ownable(msg.sender) {
        _decimals = tokenDecimals;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}`,

  game: (name) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ${name} Game Contract
/// @notice Game logic được tạo tự động
contract ${name}Game is Ownable, ReentrancyGuard {
    struct Player {
        uint256 score;
        uint256 level;
        uint256 lastPlayTime;
        bool isActive;
    }

    mapping(address => Player) public players;
    uint256 public totalPlayers;
    
    event PlayerRegistered(address indexed player);
    event ScoreUpdated(address indexed player, uint256 newScore);
    event LevelUp(address indexed player, uint256 newLevel);

    constructor() Ownable(msg.sender) {}

    function registerPlayer() external {
        require(!players[msg.sender].isActive, "Already registered");
        
        players[msg.sender] = Player({
            score: 0,
            level: 1,
            lastPlayTime: block.timestamp,
            isActive: true
        });
        
        totalPlayers++;
        emit PlayerRegistered(msg.sender);
    }

    function updateScore(uint256 points) external {
        require(players[msg.sender].isActive, "Not registered");
        
        Player storage player = players[msg.sender];
        player.score += points;
        player.lastPlayTime = block.timestamp;
        
        // Auto level up every 1000 points
        uint256 newLevel = (player.score / 1000) + 1;
        if (newLevel > player.level) {
            player.level = newLevel;
            emit LevelUp(msg.sender, newLevel);
        }
        
        emit ScoreUpdated(msg.sender, player.score);
    }

    function getPlayer(address playerAddress) external view returns (Player memory) {
        return players[playerAddress];
    }
}`,

  nft: (name, symbol) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ${name} NFT
/// @notice ERC721 NFT Collection được tạo tự động
contract ${name}NFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public maxSupply;
    uint256 public mintPrice;

    event NFTMinted(address indexed to, uint256 indexed tokenId);

    constructor(
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721("${name}", "${symbol}") Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    function mint(address to, string memory uri) external payable {
        require(_tokenIdCounter < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`
};

async function main() {
  console.log('\n🚀 SMART CONTRACT GENERATOR\n');
  console.log('Chọn loại contract:');
  console.log('1. ERC20 Token');
  console.log('2. Game Contract');
  console.log('3. NFT Collection (ERC721)');
  console.log('');

  const choice = await question('Nhập số (1-3): ');
  let contractCode = '';
  let fileName = '';

  if (choice === '1') {
    // ERC20 Token
    const name = await question('Tên token (vd: MyToken): ');
    const symbol = await question('Symbol (vd: MTK): ');
    const decimals = await question('Decimals (18): ') || '18';
    
    contractCode = templates.erc20(name, symbol, decimals);
    fileName = `${name}Token.sol`;
    
  } else if (choice === '2') {
    // Game Contract
    const name = await question('Tên game (vd: Racing): ');
    
    contractCode = templates.game(name);
    fileName = `${name}Game.sol`;
    
  } else if (choice === '3') {
    // NFT
    const name = await question('Tên NFT Collection (vd: CoolNFT): ');
    const symbol = await question('Symbol (vd: CNFT): ');
    
    contractCode = templates.nft(name, symbol);
    fileName = `${name}NFT.sol`;
    
  } else {
    console.log('❌ Lựa chọn không hợp lệ!');
    rl.close();
    return;
  }

  // Tạo file
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const filePath = path.join(contractsDir, fileName);
  
  fs.writeFileSync(filePath, contractCode);
  
  console.log('\n✅ Contract đã được tạo!');
  console.log(`📁 File: contracts/${fileName}`);
  console.log('\n📝 Các bước tiếp theo:');
  console.log(`1. Compile: npx hardhat compile`);
  console.log(`2. Test: Tạo file test trong test/${fileName.replace('.sol', '.test.js')}`);
  console.log(`3. Deploy: npx hardhat run scripts/deploy-${fileName.replace('.sol', '.js')} --network sepolia`);
  
  // Tạo deploy script
  const deployScript = generateDeployScript(fileName, choice);
  const deployPath = path.join(__dirname, `deploy-${fileName.replace('.sol', '.js')}`);
  fs.writeFileSync(deployPath, deployScript);
  console.log(`\n✅ Deploy script: scripts/${path.basename(deployPath)}`);
  
  rl.close();
}

function generateDeployScript(contractName, type) {
  const name = contractName.replace('.sol', '');
  
  return `const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ${name}...\\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\\n");

  const Contract = await hre.ethers.getContractFactory("${name}");
  ${type === '1' ? `
  const initialSupply = hre.ethers.parseUnits("1000000", 18); // 1M tokens
  const decimals = 18;
  const contract = await Contract.deploy(initialSupply, decimals);` : 
  type === '3' ? `
  const maxSupply = 10000;
  const mintPrice = hre.ethers.parseEther("0.01");
  const contract = await Contract.deploy(maxSupply, mintPrice);` : `
  const contract = await Contract.deploy();`}
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("\\n✅ ${name} deployed!");
  console.log("📍 Address:", address);
  console.log("\\n🔗 Verify on Etherscan:");
  console.log(\`npx hardhat verify --network sepolia \${address}\`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
}

main();
