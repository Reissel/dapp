// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../utils/MathUtils.sol";

struct Enemy {
    int healthPoints;
    int damage;
}

library EnemyLib {
    using MathUtils for int;

    function takesDamage(Enemy memory enemy, int damage) public pure returns (Enemy memory updatedEnemy) {
        enemy.healthPoints = enemy.healthPoints.subtractOrZero(damage);
        updatedEnemy = enemy;
    }

    function isDefeated(Enemy memory enemy) public pure returns (bool) {
        return enemy.healthPoints == 0;
    }

}