import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Game", async function () {

  async function deploy() {

    const PlayerLib__factory = await ethers.getContractFactory("PlayerLib");
    const playerLib = await PlayerLib__factory.deploy();
    const EnemyLib__factory = await ethers.getContractFactory("EnemyLib");
    const enemyLib = await EnemyLib__factory.deploy();

    const [owner, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners();

    const Game = await ethers.getContractFactory("Game", {
      libraries: {
        PlayerLib: (await playerLib.getAddress()),
        EnemyLib: (await enemyLib.getAddress()),
      }
    });
    const game = await Game.deploy();
    return { game, owner, otherAccount, otherAccount2, otherAccount3 };
  }

  async function gameStart() {

    const PlayerLib__factory = await ethers.getContractFactory("PlayerLib");
    const playerLib = await PlayerLib__factory.deploy();
    const EnemyLib__factory = await ethers.getContractFactory("EnemyLib");
    const enemyLib = await EnemyLib__factory.deploy();

    const [owner, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners();

    const Game = await ethers.getContractFactory("Game", {
      libraries: {
        PlayerLib: (await playerLib.getAddress()),
        EnemyLib: (await enemyLib.getAddress()),
      }
    });
    const game = await Game.deploy();

    await game.createEnemy(10, 2);

    await game.connect(otherAccount).createCharacter(0);
    await game.connect(otherAccount2).createCharacter(1);
    await game.connect(otherAccount3).createCharacter(2);

    return { game, owner, otherAccount, otherAccount2, otherAccount3 };
  }

  describe("Deployment", function () {
    it("Should be at the stage GM_Creation_Round", async function () {

      const { game } = await loadFixture(deploy);

      expect((await game.gameStage()).toString()).to.equal('0');

    });

    it("Should have the owner as GameMaster", async function () {

      const { game, owner } = await loadFixture(deploy);

      expect((await game.gameMaster()).toString()).to.equal(owner.address);

    });

    it("Should be at the turnIndex 0", async function () {

      const { game } = await loadFixture(deploy);

      expect((await game.turnIndex()).toString()).to.equal('0');

    });

    it("Should have zero players", async function () {

      const { game } = await loadFixture(deploy);

      expect(await game.getPlayerListLength()).to.equal(0);

    });

    it("Should have no enemy", async function () {

      const { game } = await loadFixture(deploy);

      expect((await game.enemy()).healthPoints).to.equal(0);
      expect((await game.enemy()).damage).to.equal(0);

    });
  });

  describe("Create Enemy and Players", function () {
    it("Should create Enemy and increment turnIndex", async function () {

      const { game } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      expect((await game.enemy()).healthPoints).to.equal(10);
      expect((await game.enemy()).damage).to.equal(2);
      expect((await game.turnIndex()).toString()).to.equal('1');

    });

    it("Should create Warrior and increment turnIndex", async function () {

      const { game, otherAccount } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(0);

      expect(await game.getPlayerListLength()).to.equal(1);
      expect((((await game.getPlayer(otherAccount.address)).character.class))).to.equal(0);
      expect((((await game.getPlayer(otherAccount.address)).character.healthPoints))).to.equal(25);
      expect((((await game.getPlayer(otherAccount.address)).character.energy))).to.equal(4);
      expect((((await game.getPlayer(otherAccount.address)).character.damage))).to.equal(9);
      expect((((await game.getPlayer(otherAccount.address)).character.strength))).to.equal(5);
      expect((((await game.getPlayer(otherAccount.address)).character.wisdom))).to.equal(2);
      expect((((await game.getPlayer(otherAccount.address)).character.agility))).to.equal(3);
      expect((await game.turnIndex()).toString()).to.equal('2');

    });

    it("Should create Healer and increment turnIndex", async function () {

      const { game, otherAccount } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(1);

      expect(await game.getPlayerListLength()).to.equal(1);
      expect((((await game.getPlayer(otherAccount.address)).character.class))).to.equal(1);
      expect((((await game.getPlayer(otherAccount.address)).character.healthPoints))).to.equal(15);
      expect((((await game.getPlayer(otherAccount.address)).character.energy))).to.equal(10);
      expect((((await game.getPlayer(otherAccount.address)).character.damage))).to.equal(6);
      expect((((await game.getPlayer(otherAccount.address)).character.strength))).to.equal(3);
      expect((((await game.getPlayer(otherAccount.address)).character.wisdom))).to.equal(5);
      expect((((await game.getPlayer(otherAccount.address)).character.agility))).to.equal(2);
      expect((await game.turnIndex()).toString()).to.equal('2');

    });

    it("Should create Archer and increment turnIndex", async function () {

      const { game, otherAccount } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(2);

      expect(await game.getPlayerListLength()).to.equal(1);
      expect((((await game.getPlayer(otherAccount.address)).character.class))).to.equal(2);
      expect((((await game.getPlayer(otherAccount.address)).character.healthPoints))).to.equal(10);
      expect((((await game.getPlayer(otherAccount.address)).character.energy))).to.equal(6);
      expect((((await game.getPlayer(otherAccount.address)).character.damage))).to.equal(15);
      expect((((await game.getPlayer(otherAccount.address)).character.strength))).to.equal(2);
      expect((((await game.getPlayer(otherAccount.address)).character.wisdom))).to.equal(3);
      expect((((await game.getPlayer(otherAccount.address)).character.agility))).to.equal(5);
      expect((await game.turnIndex()).toString()).to.equal('2');

    });

    it("Should not add a player that is already in the game", async function () {

      const { game, otherAccount } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(0);

      await expect(
        (game.connect(otherAccount).createCharacter(1))
      ).to.be.revertedWith("You're already in the game!");

    });

    it("Should not create a class that is already in use", async function () {

      const { game, otherAccount, otherAccount2 } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(0);

      await expect(
        (game.connect(otherAccount2).createCharacter(0))
      ).to.be.revertedWith('There is already a player using that class!');

    });

    it("Should fill player list and change Stage", async function () {

      const { game, otherAccount, otherAccount2, otherAccount3 } = await loadFixture(deploy);
      await game.createEnemy(10, 2);

      await game.connect(otherAccount).createCharacter(0);
      await game.connect(otherAccount2).createCharacter(1);
      await game.connect(otherAccount3).createCharacter(2);

      expect(await game.getPlayerListLength()).to.equal(3);
      expect((await game.gameStage()).toString()).to.equal('2');

    });
  });

  describe("Game Start", function () {
    it("Should be at the stage GM_Creation_Round", async function () {

      const { game } = await loadFixture(gameStart);

      expect((await game.gameStage()).toString()).to.equal('2');

    });

    it("Should damage a Player", async function () {

      const { game, otherAccount } = await loadFixture(gameStart);

      const otherAccount__healthPoints = (await game.getPlayer(otherAccount.address)).character.healthPoints;
      const enemy__damage = (await game.enemy()).damage;

      await game.attackPlayer(otherAccount.address);

      expect((await game.getPlayer(otherAccount.address)).character.healthPoints).to.equal(otherAccount__healthPoints - enemy__damage);

    });

    it("Should damage the Enemy", async function () {

      const { game, otherAccount } = await loadFixture(gameStart);

      const otherAccount__damage = (await game.getPlayer(otherAccount.address)).character.damage;
      const enemy__healthPoints = (await game.enemy()).healthPoints;

      await game.attackPlayer(otherAccount.address);
      await game.connect(otherAccount).attackEnemy();

      expect((await game.enemy()).healthPoints).to.equal(enemy__healthPoints - otherAccount__damage);

    });

    it("Should kill the Enemy and be at stage Game_Finished", async function () {

      const { game, otherAccount, otherAccount2 } = await loadFixture(gameStart);

      await game.attackPlayer(otherAccount.address);
      await game.connect(otherAccount).attackEnemy();
      await game.connect(otherAccount2).attackEnemy();

      expect((await game.enemy()).healthPoints).to.equal(0);
      expect((await game.gameStage()).toString()).to.equal('3');

    });

    it("Should heal a Player", async function () {

      const { game, otherAccount, otherAccount2 } = await loadFixture(gameStart);

      await game.attackPlayer(otherAccount.address);
      await game.connect(otherAccount).attackEnemy();
      await game.connect(otherAccount2).healPlayer(otherAccount.address);

      expect((await game.getPlayer(otherAccount2.address)).character.energy).to.equal(8);
      expect((await game.getPlayer(otherAccount.address)).character.healthPoints).to.equal(25);

    });

    it("Should heal a Player not to full life", async function () {

      const { game, otherAccount, otherAccount2, otherAccount3 } = await loadFixture(gameStart);

      //First round
      await game.attackPlayer(otherAccount.address);
      await game.connect(otherAccount).attackEnemy();
      await game.connect(otherAccount2).healPlayer(otherAccount2.address);
      await game.connect(otherAccount3).healPlayer(otherAccount3.address);

      //Second round
      await game.attackPlayer(otherAccount.address);
      await game.connect(otherAccount).healPlayer(otherAccount.address);

      expect((await game.getPlayer(otherAccount.address)).character.healthPoints).to.equal(23);

    });
  });

  describe("Game Over", function () {

    it("Should kill the players and be at stage Game_Over", async function () {

      const { game, owner, otherAccount, otherAccount2, otherAccount3 } = await loadFixture(deploy);

      await game.createEnemy(100, 25);

      await game.connect(otherAccount).createCharacter(0);
      await game.connect(otherAccount2).createCharacter(1);
      await game.connect(otherAccount3).createCharacter(2);

      await game.connect(owner).attackPlayer(otherAccount.address);
      await game.connect(otherAccount2).attackEnemy();
      await game.connect(otherAccount3).attackEnemy();

      await game.connect(owner).attackPlayer(otherAccount2.address);
      await game.connect(otherAccount3).attackEnemy();

      await game.connect(owner).attackPlayer(otherAccount3.address);

      expect((await game.getPlayer(otherAccount.address)).character.healthPoints).to.equal(0);
      expect((await game.getPlayer(otherAccount2.address)).character.healthPoints).to.equal(0);
      expect((await game.getPlayer(otherAccount3.address)).character.healthPoints).to.equal(0);
      
      expect((await game.gameStage()).toString()).to.equal('4');

    });
  });

})