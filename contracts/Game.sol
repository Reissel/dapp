// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Playable_Character.sol";
import "./Enemy.sol";

contract Game {
    using PlayerLib for Playable_Character;
    using EnemyLib for Enemy;

    event NewGameCreated();
    event NewEnemyCreated();
    event NewPlayerCreated();
    event EnemyDefeated();
    event GameStarted();

    Enemy public enemy;

    // Controls the turn order
    uint256 public turnIndex = 0;

    enum GameStage {
        GM_Creation_Round,
        Player_Creation_Round,
        Game_Start,
        Game_Finished,
        Game_Over
    }
    GameStage public gameStage;

    struct Player {
        address id;
        Playable_Character character;
        Enemy enemy;
        uint256 turnTime;
    }

    address public gameMaster;

    mapping(address => Player) public players;

    address[] public playerList;

    function getPlayer(address myAddress) public view returns(Player memory){
        return players[myAddress];
    }

    function getPlayerListLength() public view returns (uint256) {
        return playerList.length;
    }

    function incrementTurnIndex() private {

        int deadPlayer = 0;

        if(gameStage == GameStage.Game_Finished) return;

        turnIndex += 1;

        // Loops through players to validate if a player 
        for (uint256 i = 0; i < playerList.length; i++) {

            if(players[playerList[i]].character.healthPoints == 0 && players[playerList[i]].turnTime == turnIndex) {
                turnIndex += 1;
                deadPlayer += 1;
            }

        }

        if(deadPlayer == 3) {
            gameStage = GameStage.Game_Over;
        }
        
        // Reset turn Order
        if(turnIndex > 3) turnIndex = 0;
    }

    // Creates a new enemy for the game
    function createEnemy(int healthPoints, int damage) public {

        require(
            enemy.healthPoints == 0 && enemy.damage == 0,
            "There is already an enemy created!"
        );

        require(
            gameStage == GameStage.GM_Creation_Round,
            "Can't create an enemy in this game stage!"
        );

        require(
            msg.sender == gameMaster,
            "Only the game master can create an Enemy!"
        );

        enemy = Enemy(healthPoints, damage);

        players[gameMaster].id = gameMaster;
        players[gameMaster].enemy = enemy;

        players[gameMaster].turnTime = turnIndex;
        turnIndex += 1;
        emit NewEnemyCreated();

        gameStage = GameStage.Player_Creation_Round;
    }


    // Creates a new character for a player
    function createCharacter(int classInput) public {

        require(
            classInput >= 0 && classInput < 3,
            "Invalid option for class! 0 = Warrior | 1 = Healer | 2 = Archer"
        );

        require(
            gameStage == GameStage.Player_Creation_Round,
            "Can't create a Player in this game stage!"
        );

        require(
            gameMaster != msg.sender,
            "The Game Master can't join as a Player!"
        );

        // Searches if another player has already picked the same class
        for (uint256 i = 0; i < playerList.length; i++) {

            require(
                msg.sender != players[playerList[i]].id,
                "You're already in the game!"
            );
            
            require(
                classInput != players[playerList[i]].character.class,
                "There is already a player using that class!"
            );

        }

        players[msg.sender].id = msg.sender;

        if (classInput == 0) {
            int healthPoints = 25;
            int energy = 4;
            int damage = 9;
            int strength = 5;
            int wisdom = 2;
            int agility = 3;
            players[msg.sender].character = Playable_Character(healthPoints, energy, damage, strength, wisdom, agility, classInput);
        } else if (classInput == 1) {
            int healthPoints = 15;
            int energy = 10;
            int damage = 6;
            int strength = 3;
            int wisdom = 5;
            int agility = 2;
            players[msg.sender].character = Playable_Character(healthPoints, energy, damage, strength, wisdom, agility, classInput);
        } else {
            int healthPoints = 10;
            int energy = 6;
            int damage = 15;
            int strength = 2;
            int wisdom = 3;
            int agility = 5;
            players[msg.sender].character = Playable_Character(healthPoints, energy, damage, strength, wisdom, agility, classInput);
        }

        playerList.push(msg.sender);
        //turnList.push(players[player]);
        players[msg.sender].turnTime = turnIndex;

        incrementTurnIndex();

        if(playerList.length == 3) {
            gameStage = GameStage.Game_Start;
            emit GameStarted();
        }

        emit NewPlayerCreated();
    }

    // Attacks enemy
    function attackEnemy() public {

        require(
            gameStage == GameStage.Game_Start,
            "Can only attack the enemy when the game has already started!"
        );

        require(
            turnIndex == players[msg.sender].turnTime,
            "It's not your turn yet!"
        );

        int hitPoints = players[msg.sender].character.damage;
        enemy = enemy.takesDamage(hitPoints);
        if(enemy.isDefeated()) {
            emit EnemyDefeated();
            gameStage = GameStage.Game_Finished;
        }

        incrementTurnIndex();
    }

    // Enemy attacks
    function attackPlayer(address player) public {

        require(
            gameStage == GameStage.Game_Start,
            "Can only attack a player when the game has already started!"
        );

        require(
            msg.sender == gameMaster,
            "Only the Game Master can attack with the Enemy!"
        );

        require(
            players[player].character.healthPoints != 0,
            "You can't attack a player that is already defeated!"
        );

        require(
            turnIndex == players[msg.sender].turnTime,
            "It's not the Enemy turn yet!"
        );

        players[player].character = players[player].character.takesDamage(enemy.damage);
        
        incrementTurnIndex();
    }

    // Enemy attacks
    function healPlayer(address player) public {

        require(
            turnIndex == players[msg.sender].turnTime,
            "It's not your turn yet!"
        );

        require(
            players[msg.sender].enemy.healthPoints == 0 && players[msg.sender].enemy.damage == 0,
            "Enemy can't heal players and itself!"
        );

        require(
            players[msg.sender].character.energy > 2,
            "You don't have enough energy to heal! Energy Cost = 2"
        );

        players[msg.sender].character = players[msg.sender].character.useEnergy(2);

        int healPoints = players[msg.sender].character.wisdom;

        players[player].character = players[player].character.getHealed(healPoints);

        incrementTurnIndex();
    }

    constructor() {
        gameMaster = msg.sender;
        gameStage = GameStage.GM_Creation_Round;
        emit NewGameCreated();
    }
}