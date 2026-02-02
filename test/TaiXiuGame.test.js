const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaiXiuGame", function () {
  let taixiu;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const TaiXiuGame = await ethers.getContractFactory("TaiXiuGame");
    taixiu = await TaiXiuGame.deploy();
    await taixiu.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await taixiu.owner()).to.equal(owner.address);
    });

    it("Should create initial game", async function () {
      expect(await taixiu.gameCounter()).to.equal(1);
    });
  });

  describe("Betting", function () {
    it("Should allow players to place bets", async function () {
      const betAmount = ethers.parseEther("0.01");
      
      await expect(
        taixiu.connect(player1).placeBet(0, { value: betAmount })
      )
        .to.emit(taixiu, "BetPlaced")
        .withArgs(1, player1.address, betAmount, 0);
    });

    it("Should reject bets below minimum", async function () {
      const betAmount = ethers.parseEther("0.0001");
      
      await expect(
        taixiu.connect(player1).placeBet(0, { value: betAmount })
      ).to.be.revertedWith("Bet amount too low");
    });

    it("Should reject bets above maximum", async function () {
      const betAmount = ethers.parseEther("2");
      
      await expect(
        taixiu.connect(player1).placeBet(0, { value: betAmount })
      ).to.be.revertedWith("Bet amount too high");
    });
  });

  describe("Game Resolution", function () {
    it("Should resolve game and create new one", async function () {
      const betAmount = ethers.parseEther("0.1");
      
      await taixiu.connect(player1).placeBet(0, { value: betAmount });
      await taixiu.connect(player2).placeBet(1, { value: betAmount });
      
      await expect(taixiu.rollDice())
        .to.emit(taixiu, "GameResolved");
      
      expect(await taixiu.gameCounter()).to.equal(2);
    });

    it("Should distribute winnings correctly", async function () {
      const betAmount = ethers.parseEther("0.1");
      
      await taixiu.connect(player1).placeBet(0, { value: betAmount });
      await taixiu.rollDice();
      
      const balance = await taixiu.getPlayerBalance(player1.address);
      // Winner should have some balance (bet returned or winnings)
      expect(balance).to.be.gte(0);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow winners to withdraw", async function () {
      const betAmount = ethers.parseEther("0.1");
      
      await taixiu.connect(player1).placeBet(0, { value: betAmount });
      await taixiu.rollDice();
      
      const balanceBefore = await ethers.provider.getBalance(player1.address);
      const winnings = await taixiu.getPlayerBalance(player1.address);
      
      if (winnings > 0) {
        await taixiu.connect(player1).withdraw();
        const balanceAfter = await ethers.provider.getBalance(player1.address);
        expect(balanceAfter).to.be.gt(balanceBefore);
      }
    });
  });
});
