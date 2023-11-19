import { ethers } from "hardhat";

async function main() {

  const PlayerLib__factory = await ethers.getContractFactory("PlayerLib");
  const playerLib = await PlayerLib__factory.deploy();
  const EnemyLib__factory = await ethers.getContractFactory("EnemyLib");
  const enemyLib = await EnemyLib__factory.deploy();

  const Game = await ethers.getContractFactory("Game", {
    libraries: {
      PlayerLib: (await playerLib.getAddress()),
      EnemyLib: (await enemyLib.getAddress()),
    }
  });
  const game = await Game.deploy();

  await game.waitForDeployment();

  console.log(
    `Game deployed to ${game.target}`
  );
}


// npx hardhat run scripts/deploy.ts --network localhost/ganache
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
