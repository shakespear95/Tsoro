import { useState, useEffect } from 'react';
import './App.css';
import { getAIMove, getSimpleAIMove } from './aiPlayer';

function App() {
  // Initialize the game board: 4x4 grid
  // Player 1 (top): holes 0-7, bank at chosen position
  // Player 2 (bottom): holes 8-15, bank at chosen position
  const initializeBoard = () => {
    const board = new Array(16).fill(0);
    // Player 1's holes: startingPebbles each, except bank (0 pebbles)
    for (let i = 0; i <= 7; i++) {
      if (i !== player1Bank) {
        board[i] = startingPebbles;
      }
    }
    // Player 2's holes: startingPebbles each, except bank (0 pebbles)
    for (let i = 8; i <= 15; i++) {
      if (i !== player2Bank) {
        board[i] = startingPebbles;
      }
    }
    return board;
  };

  const [gameState, setGameState] = useState('setup'); // 'setup', 'welcome', 'playing'
  const [gameMode, setGameMode] = useState('two-player'); // 'one-player' or 'two-player'
  const [aiDifficulty, setAiDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [player1Bank, setPlayer1Bank] = useState(7); // Default bank positions
  const [player2Bank, setPlayer2Bank] = useState(15);
  const [direction, setDirection] = useState('clockwise'); // 'clockwise' or 'counterclockwise'
  const [startingPebbles, setStartingPebbles] = useState(3); // Number of pebbles per hole at start

  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState(2); // Player 2 starts (bottom player)
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('Player 2\'s turn (Light Wood)');
  const [animating, setAnimating] = useState(false);
  const [handPosition, setHandPosition] = useState(null);
  const [handAction, setHandAction] = useState(null); // 'picking' or 'dropping'

  // Check if a hole belongs to a player
  const isPlayerHole = (index, player) => {
    if (player === 1) {
      return index >= 0 && index <= 7;
    } else {
      return index >= 8 && index <= 15;
    }
  };

  // Get the bank index for a player
  const getBankIndex = (player) => {
    return player === 1 ? 7 : 15;
  };

  // Check win condition
  const checkWin = (newBoard) => {
    const player1BankCount = newBoard[player1Bank];
    const player2BankCount = newBoard[player2Bank];
    const totalPebbles = 7 * startingPebbles; // 7 holes * pebbles per hole

    if (player1BankCount === totalPebbles) {
      setWinner(1);
      setGameOver(true);
      setMessage('Player 1 (Dark Wood) wins!');
      return true;
    }
    if (player2BankCount === totalPebbles) {
      setWinner(2);
      setGameOver(true);
      setMessage('Player 2 (Light Wood) wins!');
      return true;
    }
    return false;
  };

  // Get next hole index within player's territory
  const getNextHole = (currentIndex, player) => {
    const bankHole = player === 1 ? player1Bank : player2Bank;
    const minHole = player === 1 ? 0 : 8;
    const maxHole = player === 1 ? 7 : 15;

    if (direction === 'clockwise') {
      const next = currentIndex + 1;
      if (next > maxHole) return minHole;
      return next;
    } else {
      const next = currentIndex - 1;
      if (next < minHole) return maxHole;
      return next;
    }
  };

  // Main sowing logic with relay mechanics
  const handleHoleClick = async (index) => {
    if (gameOver || animating) return;

    // Check if it's a valid move
    const isBank = index === player1Bank || index === player2Bank;
    if (isBank) {
      setMessage('Cannot select a bank!');
      return;
    }

    if (!isPlayerHole(index, currentPlayer)) {
      setMessage(`Not your hole! Player ${currentPlayer}'s turn.`);
      return;
    }

    if (board[index] === 0) {
      setMessage('Cannot select an empty hole!');
      return;
    }

    setAnimating(true);

    // Show hand picking up pebbles
    setHandPosition(index);
    setHandAction('picking');
    await new Promise(resolve => setTimeout(resolve, 800));

    let newBoard = [...board];
    let currentIndex = index;
    let pebbles = newBoard[currentIndex];
    newBoard[currentIndex] = 0;
    setBoard([...newBoard]);

    await new Promise(resolve => setTimeout(resolve, 400));

    // Sowing loop with relay mechanics - stay within player's territory
    while (pebbles > 0) {
      // Move to next hole within player's territory
      currentIndex = getNextHole(currentIndex, currentPlayer);

      // Move hand to next hole
      setHandPosition(currentIndex);
      setHandAction('dropping');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Drop one pebble
      newBoard[currentIndex] = newBoard[currentIndex] + 1;
      pebbles--;

      // Update board and wait
      setBoard([...newBoard]);
      await new Promise(resolve => setTimeout(resolve, 600));

      // If this was the last pebble, check for relay
      if (pebbles === 0) {
        const landedCount = newBoard[currentIndex];

        // Check if we landed in a bank (turn ends)
        if (currentIndex === player1Bank || currentIndex === player2Bank) {
          break; // Turn ends when landing in bank
        }

        // Check for relay: if landed hole now has 2+ pebbles (was not empty), continue
        // Turn only ends if you land in an empty hole (which now has 1 pebble)
        if (landedCount >= 2) {
          // Show picking animation for relay
          setHandAction('picking');
          await new Promise(resolve => setTimeout(resolve, 800));

          pebbles = newBoard[currentIndex];
          newBoard[currentIndex] = 0;
          setBoard([...newBoard]);
          setMessage(`Relay! Continuing from hole ${currentIndex} with ${pebbles} pebbles...`);
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
    }

    // Hide hand
    setHandPosition(null);
    setHandAction(null);

    // Check for win
    if (!checkWin(newBoard)) {
      // Switch player
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      setCurrentPlayer(nextPlayer);
      setMessage(`Player ${nextPlayer}'s turn (${nextPlayer === 1 ? 'Blue' : 'Yellow'})`);
    }

    setAnimating(false);
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer(2);
    setGameOver(false);
    setWinner(null);
    setMessage('Player 2\'s turn (Light Wood)');
    setAnimating(false);
    setHandPosition(null);
    setHandAction(null);
  };

  // AI Player Effect - triggers when it's the AI's turn
  useEffect(() => {
    if (gameMode === 'one-player' && currentPlayer === 2 && !gameOver && !animating && gameState === 'playing') {
      const makeAIMove = async () => {
        setMessage('Computer is thinking...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to show "thinking"

        try {
          // Get AI move from Supabase Edge Function
          const aiMove = await getAIMove(board, currentPlayer, player1Bank, player2Bank, direction, startingPebbles, aiDifficulty);

          // Execute the AI's move
          await handleHoleClick(aiMove);
        } catch (error) {
          console.error('AI move error:', error);
          setMessage('AI error - your turn!');
          setCurrentPlayer(1);
        }
      };

      makeAIMove();
    }
  }, [currentPlayer, gameOver, animating, gameMode, gameState]);

  // Render a single hole
  const renderHole = (index) => {
    const isBank = index === 7 || index === 15;
    const isPlayer1 = index <= 7;
    const isClickable = !gameOver && !animating &&
                       isPlayerHole(index, currentPlayer) &&
                       !isBank &&
                       board[index] > 0;
    const hasHand = handPosition === index;

    return (
      <div
        key={index}
        className={`hole ${isBank ? 'bank' : ''} ${isPlayer1 ? 'player1' : 'player2'} ${isClickable ? 'clickable' : ''}`}
        onClick={() => handleHoleClick(index)}
        id={`hole-${index}`}
      >
        <div className="hole-index">{index}</div>
        <div className="pebbles">
          {Array.from({ length: board[index] }).map((_, i) => (
            <div key={i} className="pebble"></div>
          ))}
        </div>
        <div className="pebble-count">{board[index]}</div>
        {hasHand && (
          <div className={`hand ${handAction}`}>
            ✊
          </div>
        )}
      </div>
    );
  };

  // Render setup page
  if (gameState === 'setup') {
    return (
      <div className="App">
        <div className="setup-container">
          <h1>🇿🇼 Tsoro - Game Setup</h1>

          <div className="setup-section">
            <h2>Game Mode</h2>
            <label>Select game mode:</label>
            <select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
              <option value="two-player">Two Players (Local)</option>
              <option value="one-player">One Player (vs Computer)</option>
            </select>

            {gameMode === 'one-player' && (
              <>
                <label>AI Difficulty:</label>
                <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                  <option value="easy">Easy (Random moves)</option>
                  <option value="medium">Medium (Strategic AI)</option>
                  <option value="hard">Hard (ChatGPT Expert)</option>
                </select>
              </>
            )}
          </div>

          <div className="setup-section">
            <h2>Player 1 (Dark Wood) {gameMode === 'one-player' ? '- You' : ''}</h2>
            <label>Choose your bank hole (0-7):</label>
            <select value={player1Bank} onChange={(e) => setPlayer1Bank(Number(e.target.value))}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <option key={i} value={i}>Hole {i}</option>
              ))}
            </select>
          </div>

          <div className="setup-section">
            <h2>Player 2 (Light Wood) {gameMode === 'one-player' ? '- Computer' : ''}</h2>
            <label>Choose {gameMode === 'one-player' ? 'computer\'s' : 'your'} bank hole (8-15):</label>
            <select value={player2Bank} onChange={(e) => setPlayer2Bank(Number(e.target.value))}>
              {[8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                <option key={i} value={i}>Hole {i}</option>
              ))}
            </select>
          </div>

          <div className="setup-section">
            <h2>Game Settings</h2>
            <label>Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="clockwise">Clockwise</option>
              <option value="counterclockwise">Counter-Clockwise</option>
            </select>

            <label>Starting pebbles per hole:</label>
            <select value={startingPebbles} onChange={(e) => setStartingPebbles(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <option key={i} value={i}>{i} pebbles</option>
              ))}
            </select>
          </div>

          <button className="start-button" onClick={() => setGameState('welcome')}>
            Continue to Game
          </button>
        </div>
      </div>
    );
  }

  // Render welcome page
  if (gameState === 'welcome') {
    return (
      <div className="App">
        <div className="welcome-container">
          <h1>🇿🇼 Tsoro</h1>
          <h2>Zimbabwean Mancala</h2>

          <div className="game-rules">
            <h3>How to Play:</h3>
            <ul>
              <li>Each player has 7 holes with {startingPebbles} pebbles each, plus 1 bank (starts empty)</li>
              <li>Click a hole on your side to pick up all pebbles and sow them {direction}</li>
              <li><strong>Relay:</strong> If your last pebble lands in a hole that already has pebbles (2+), pick them all up and continue!</li>
              <li>Your turn ends when the last pebble lands in an empty hole (now 1) or your bank</li>
              <li><strong>Win:</strong> First player to get all {7 * startingPebbles} pebbles in their bank wins!</li>
            </ul>
          </div>

          <div className="player-info">
            <div className="player-card player1-card">
              <h3>Player 1 - Dark Wood</h3>
              <p>Bank: Hole {player1Bank}</p>
            </div>
            <div className="player-card player2-card">
              <h3>Player 2 - Light Wood</h3>
              <p>Bank: Hole {player2Bank}</p>
            </div>
          </div>

          <button className="start-button" onClick={() => { setBoard(initializeBoard()); setGameState('playing'); }}>
            Start Game
          </button>
          <button className="back-button" onClick={() => setGameState('setup')}>
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  // Render game page
  return (
    <div className="App">
      <h1>🇿🇼 Tsoro</h1>

      <div className="game-info">
        <div className={`player-indicator ${currentPlayer === 1 ? 'active' : ''}`}>
          Player 1 (Dark Wood) - Bank: {board[player1Bank]}
        </div>
        <div className="message">{message}</div>
        <div className={`player-indicator ${currentPlayer === 2 ? 'active' : ''}`}>
          Player 2 (Light Wood) - Bank: {board[player2Bank]}
        </div>
      </div>

      <div className="game-container">
        <div className="game-board">
          {/* Player 1's side (top) - 2 rows in circular pattern */}
          <div className="player-side player1-side">
            <div className="holes-row">
              {[0, 1, 2, 3].map(renderHole)}
            </div>
            <div className="holes-row">
              {[7, 6, 5, 4].map(renderHole)}
            </div>
          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* Player 2's side (bottom) - 2 rows in circular pattern */}
          <div className="player-side player2-side">
            <div className="holes-row">
              {[8, 9, 10, 11].map(renderHole)}
            </div>
            <div className="holes-row">
              {[15, 14, 13, 12].map(renderHole)}
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={resetGame} className="reset-button">
          New Game
        </button>
        <button onClick={() => setGameState('setup')} className="reset-button">
          Setup
        </button>
      </div>
    </div>
  );
}

export default App;
