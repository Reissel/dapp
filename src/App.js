import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Game from "./artifacts/contracts/Game.sol/Game.json";

const gameAddress = "0x4D2F77c5E8e973024Ae31869156DB57801d63F24";

function App() {

  const [healthpointsInput, setHealthpoints] = useState('');
  const [damageInput, setDamage] = useState('');
  const [stage, setStage] = useState('');
  const [classInput, setClassInput] = useState('');
  const [turnIndex, setTurnIndex] = useState('');
  const [playerPublicKey, setPlayerPublicKey] = useState('');
  const [enemyHealth, setEnemyHealth] = useState('');
  const [enemyDamage, setEnemyDamage] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player3, setPlayer3] = useState('');
  
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchGameStage() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(gameAddress, Game.abi, provider);
      try {
        const gameStage = (await contract.gameStage()).toString();
        const playerListLength = (await contract.getPlayerListLength()).toString();
        const turnIndex = (await contract.turnIndex()).toString();
        
        console.log('Stage: ', gameStage);
        console.log('Player List Length: ', playerListLength);
        console.log('Turn Index: ', turnIndex);
        setStage(gameStage);
        setTurnIndex(turnIndex);
        /*
        if(gameStage == 2) {
          
          const players = (await contract.playerList());
          await players.forEach(async key => {
            const player = (await contract.getPlayer(key));
            const playerTurn = player.turnTime;
            switch(playerTurn) {
              case 1:
                console.log("Setting player1");
                setPlayer1(player);
                console.log("Done setting player1");
                break;
              case 2:
                setPlayer2(player);
                break;
              case 3:
                setPlayer3(player);
                break;
              default:
                console.log("No player!");
            }
          });
          const enemyStats = (await contract.enemy()).toString();
          setEnemyHealth(enemyStats.healthpoints);
          setEnemyDamage(enemyStats.damage);
        }
        */
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  }

  async function createEnemy() {

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(gameAddress, Game.abi, signer);
      try {
        const healthpoints = parseInt(healthpointsInput, 10);
        const damage = parseInt(damageInput, 10);
        const transaction = await contract.createEnemy(healthpoints, damage);
        await transaction.wait();
        console.log('Finished Enemy Creation');
      } catch (error) {
        console.log('Error: ', error);
      }

      setHealthpoints('');
      setDamage('');
    }
  }

  async function createCharacter() {

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(gameAddress, Game.abi, signer);
      try {
        const playerClass = parseInt(classInput, 10);
        const transaction = await contract.createCharacter(playerClass);
        await transaction.wait();
        console.log('Finished Character Creation');
      } catch (error) {
        console.log('Error: ', error);
      }

      setHealthpoints('');
      setDamage('');
    }
  }

  async function attackPlayer() {

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(gameAddress, Game.abi, signer);
      try {
        const playerAddress = playerPublicKey;
        const transaction = await contract.attackPlayer(playerAddress);
        await transaction.wait();
        console.log('Finished Attack');
      } catch (error) {
        console.log('Error: ', error);
      }
      setPlayerPublicKey('');
    }
  }

  async function attackEnemy() {

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(gameAddress, Game.abi, signer);
      try {
        const transaction = await contract.attackEnemy();
        await transaction.wait();
        console.log('Finished Attack to Enemy');
      } catch (error) {
        console.log('Error: ', error);
      }
      setPlayerPublicKey('');
    }
  }

  async function healPlayer() {

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(gameAddress, Game.abi, signer);
      try {
        const playerAddress = playerPublicKey;
        const transaction = await contract.healPlayer(playerAddress);
        await transaction.wait();
        console.log('Finished Heal Player');
      } catch (error) {
        console.log('Error: ', error);
      }
      setPlayerPublicKey('');
    }
  }

  const handleValue1Change = (event) => {
    setHealthpoints(event.target.value);
  };

  const handleValue2Change = (event) => {
    setDamage(event.target.value);
  };

  const handleValue3Change = (event) => {
    setClassInput(event.target.value);
  };

  const handleValue4Change = (event) => {
    setPlayerPublicKey(event.target.value);
  };

  useEffect(() => {
    // Fetch contract status when the component mounts
    fetchGameStage();
  });

  return (
    
    <div className="App">
      { stage == 0 &&
      <div>
        <h2>
          Enemy Creation
        </h2>

        <label>
        Value 1:
        <input type="text" value={healthpointsInput} onChange={handleValue1Change} placeholder="Enemy's HealthPoints" />
        </label>

        <br />

        <label>
          Value 2:
          <input type="text" value={damageInput} onChange={handleValue2Change} placeholder="Enemy's Damage" />
        </label>

        <br />

        <button onClick={createEnemy}>Confirm Enemy</button>

      </div>
      }
      { stage == 1 &&
      <div>
        <h2>
          Player Creation
        </h2>

        <div className='characters-classes'>
          <div className='warrior'>
            <pre>
            {`
            0 = Warrior
            healthPoints = 25;
            energy = 4;
            damage = 9;
            strength = 5;
            wisdom = 2;
            agility = 3;
            `}
            </pre>
            
          </div>
          <div className='healer'>
            <pre>
              {`
              1 = Healer
              healthPoints = 15;
              energy = 10;
              damage = 6;
              strength = 3;
              wisdom = 5;
              agility = 2;
              `}
            </pre>
          </div>
          <div className='archer'>
            <pre>
              {`
              2 = Archer:
              healthPoints = 10;
              energy = 6;
              damage = 15;
              strength = 2;
              wisdom = 3;
              agility = 5;
              `}
            </pre>
          </div>
        </div>

        <label>
        Value 1:
        <input type="text" value={classInput} onChange={handleValue3Change} placeholder="Player Class" />
        </label>

        <br />

        <button onClick={createCharacter}>Confirm Class</button>

      </div>
      }
      { stage == 2 && turnIndex == 0 &&
        //Enemy turn to act
        <div>
          <h2>
            Enemy Turn
          </h2>
          <label>
          Value 1:
          <input type="text" value={playerPublicKey} onChange={handleValue4Change} placeholder="Player Public Key" />
          </label>

          <br />

          <button onClick={attackPlayer}>Confirm Target</button>

        </div>

      }
      { stage == 2 && turnIndex != 0 &&
        //Players turn to act
        <div>
          <h2>
            Players Turn
          </h2>
          <label>
            Enemy Status:
            Health: {enemyHealth}
            Damage: {enemyDamage}
          </label>
          <label>
          Value 1:
          <input type="text" value={playerPublicKey} onChange={handleValue4Change} placeholder="Player Public Key" />
          </label>

          <br />

          <button onClick={attackEnemy}>Confirm Attack Action</button>
          <button onClick={healPlayer}>Confirm Heal Action</button>

        </div>

      }

      

    </div>
    
  );
}

export default App;
