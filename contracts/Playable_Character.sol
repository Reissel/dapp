// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../utils/MathUtils.sol";

/*
struct Warrior {
    int healthPoints = 25;
    int energy = 4;
    int damage = 9;
    int strength = 5;
    int wisdom = 2;
    int agility = 3;
}

struct Healer {
    int healthPoints = 15;
    int energy = 10;
    int damage = 6;
    int strength = 3;
    int wisdom = 5;
    int agility = 2;
}

struct Archer {
    int healthPoints = 10;
    int energy = 6;
    int damage = 15;
    int strength = 2;
    int wisdom = 3;
    int agility = 5;
}
*/

struct Playable_Character {
    int healthPoints;
    int energy;
    int damage;
    int strength;
    int wisdom;
    int agility;
    int class;
}

library PlayerLib {
    using MathUtils for int;

    function takesDamage(Playable_Character memory character, int hitpoints) public pure returns (Playable_Character memory) {
        character.healthPoints = character.healthPoints.subtractOrZero(hitpoints);
        return character;
    }

    function useEnergy(Playable_Character memory character, int energy_spent) public pure returns (Playable_Character memory) {
        character.energy -= energy_spent;
        return character;
    }

    function getHealed(Playable_Character memory character, int hitpoints) public pure returns (Playable_Character memory) {

        int maxLife = character.strength * 5;
        character.healthPoints += hitpoints;

        if(character.healthPoints > maxLife) character.healthPoints = maxLife;
        return character;
    }

}