const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FishingGame", function () {
  let fishing;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const FishingGame = await ethers.getContractFactory("FishingGame");
    fishing = await FishingGame.deploy();
    await fishing.waitForDeployment();
    
    // Fund contract
    await fishing.fundContract({ value: ethers.parseEther("1") });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fishing.owner()).to.equal(owner.address);
    });

    it("Should have funded balance", async function () {
      const balance = await ethers.provider.getBalance(await fishing.getAddress());
      expect(balance).to.be.gt(0);
    });
  });

  describe("Sessions", function () {
    it("Should allow players to start session", async function () {
      const entryFee = ethers.parseEther("0.001");
      
      await expect(
        fishing.connect(player1).startSession({ value: entryFee })
      )
        .to.emit(fishing, "SessionStarted")
        .withArgs(player1.address, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });

    it("Should reject session with insufficient fee", async function () {
      const lowFee = ethers.parseEther("0.0001");
      
      await expect(
        fishing.connect(player1).startSession({ value: lowFee })
      ).to.be.revertedWith("Insufficient entry fee");
    });

    it("Should prevent multiple active sessions", async function () {
      const entryFee = ethers.parseEther("0.001");
      
      await fishing.connect(player1).startSession({ value: entryFee });
      
      await expect(
        fishing.connect(player1).startSession({ value: entryFee })
      ).to.be.revertedWith("Session already active");
    });
  });

  describe("Fishing", function () {
    beforeEach(async function () {
      await fishing.connect(player1).startSession({ 
        value: ethers.parseEther("0.001") 
      });
    });

    it("Should allow catching fish", async function () {
      await expect(fishing.connect(player1).catchFish())
        .to.emit(fishing, "FishCaught");
    });

    it("Should require active session", async function () {
      await expect(
        fishing.connect(player2).catchFish()
      ).to.be.revertedWith("No active session");
    });

    it("Should track fish caught", async function () {
      await fishing.connect(player1).catchFish();
      await fishing.connect(player1).catchFish();
      
      const session = await fishing.getActiveSession(player1.address);
      expect(session.fishCaught).to.equal(2);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await fishing.connect(player1).startSession({ 
        value: ethers.parseEther("0.001") 
      });
      
      // Catch some fish
      for (let i = 0; i < 5; i++) {
        await fishing.connect(player1).catchFish();
      }
    });

    it("Should accumulate earnings", async function () {
      const earnings = await fishing.playerEarnings(player1.address);
      expect(earnings).to.be.gt(0);
    });

    it("Should allow claiming rewards", async function () {
      const earnings = await fishing.playerEarnings(player1.address);
      
      if (earnings > 0) {
        const balanceBefore = await ethers.provider.getBalance(player1.address);
        
        await fishing.connect(player1).claimRewards();
        
        const balanceAfter = await ethers.provider.getBalance(player1.address);
        expect(balanceAfter).to.be.gt(balanceBefore);
      }
    });
  });

  describe("Leaderboard", function () {
    it("Should track top players", async function () {
      // Player 1 plays
      await fishing.connect(player1).startSession({ 
        value: ethers.parseEther("0.001") 
      });
      await fishing.connect(player1).catchFish();
      await fishing.connect(player1).endSession();
      
      // Player 2 plays
      await fishing.connect(player2).startSession({ 
        value: ethers.parseEther("0.001") 
      });
      await fishing.connect(player2).catchFish();
      await fishing.connect(player2).endSession();
      
      const [players, scores] = await fishing.getLeaderboard();
      expect(players.length).to.be.gte(1);
      expect(scores.length).to.equal(players.length);
    });
  });

  describe("Jackpot", function () {
    it("Should accumulate jackpot pool", async function () {
      const entryFee = ethers.parseEther("0.001");
      
      await fishing.connect(player1).startSession({ value: entryFee });
      
      const jackpot = await fishing.jackpotPool();
      expect(jackpot).to.be.gte(entryFee);
    });
  });
});
