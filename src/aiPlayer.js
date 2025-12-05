import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through a backend
});

/**
 * Get AI move suggestion from ChatGPT
 * @param {Array} board - Current game board state
 * @param {number} currentPlayer - Current player (1 or 2)
 * @param {number} player1Bank - Player 1's bank hole index
 * @param {number} player2Bank - Player 2's bank hole index
 * @param {string} direction - Direction of play ('clockwise' or 'counterclockwise')
 * @param {number} startingPebbles - Starting pebbles per hole
 * @param {string} difficulty - AI difficulty level ('easy', 'medium', 'hard')
 * @returns {Promise<number>} - The hole index to play
 */
export async function getAIMove(board, currentPlayer, player1Bank, player2Bank, direction, startingPebbles, difficulty = 'medium') {
  const playerHoles = currentPlayer === 1
    ? Array.from({length: 8}, (_, i) => i).filter(i => i !== player1Bank && board[i] > 0)
    : Array.from({length: 8}, (_, i) => i + 8).filter(i => i !== player2Bank && board[i] > 0);

  if (playerHoles.length === 0) {
    throw new Error('No valid moves available');
  }

  // For easy difficulty, just pick a random valid move
  if (difficulty === 'easy') {
    return playerHoles[Math.floor(Math.random() * playerHoles.length)];
  }

  const bankHole = currentPlayer === 1 ? player1Bank : player2Bank;

  const prompt = `You are an expert Tsoro (Zimbabwean Mancala) player. Analyze the current game state and suggest the best move.

Game Rules:
- This is Tsoro, a Mancala variant from Zimbabwe
- Board has 16 holes (0-15): Player 1 has holes 0-7, Player 2 has holes 8-15
- Player 1's bank is hole ${player1Bank}, Player 2's bank is hole ${player2Bank}
- Direction: ${direction}
- Sowing: Pick up all pebbles from a hole and drop them one-by-one in consecutive holes
- Relay Rule: If the last pebble lands in a hole with 2+ pebbles, pick up all those pebbles and continue
- Turn ends: When last pebble lands in an empty hole (now 1 pebble) or in the bank
- Win condition: First to get ${7 * startingPebbles} pebbles in their bank wins

Current Board State:
${board.map((count, i) => `Hole ${i}: ${count} pebbles${i === player1Bank ? ' (P1 Bank)' : i === player2Bank ? ' (P2 Bank)' : ''}`).join('\n')}

Current Player: Player ${currentPlayer}
Your bank: Hole ${bankHole}
Valid moves: Holes ${playerHoles.join(', ')}

${difficulty === 'hard' ? 'Play at EXPERT level. Prioritize:' : 'Play at INTERMEDIATE level. Consider:'}
1. Moves that trigger relays (landing in holes with 2+ pebbles)
2. Moves that get pebbles into your bank
3. Moves that set up future relay chains
4. Defensive moves to prevent opponent relays
5. Long-term strategic positioning

Respond with ONLY the hole number (just the number, nothing else).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Tsoro (Mancala) game AI. You analyze board positions and suggest optimal moves. Respond with only the hole number.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: difficulty === 'hard' ? 0.3 : 0.7,
      max_tokens: 10
    });

    const suggestedMove = parseInt(response.choices[0].message.content.trim());

    // Validate the move
    if (playerHoles.includes(suggestedMove)) {
      return suggestedMove;
    } else {
      console.warn('AI suggested invalid move:', suggestedMove, 'Falling back to random');
      return playerHoles[Math.floor(Math.random() * playerHoles.length)];
    }
  } catch (error) {
    console.error('Error getting AI move:', error);
    // Fallback to random move if API fails
    return playerHoles[Math.floor(Math.random() * playerHoles.length)];
  }
}

/**
 * Simple rule-based AI (fallback, no API needed)
 */
export function getSimpleAIMove(board, currentPlayer, player1Bank, player2Bank) {
  const bankHole = currentPlayer === 1 ? player1Bank : player2Bank;
  const playerHoles = currentPlayer === 1
    ? Array.from({length: 8}, (_, i) => i).filter(i => i !== player1Bank && board[i] > 0)
    : Array.from({length: 8}, (_, i) => i + 8).filter(i => i !== player2Bank && board[i] > 0);

  if (playerHoles.length === 0) {
    throw new Error('No valid moves available');
  }

  // Strategy: Prefer moves that might land in bank or create relays
  const scoredMoves = playerHoles.map(hole => {
    const pebbles = board[hole];
    let score = 0;

    // Prefer moves with more pebbles (more likely to create relays)
    score += pebbles;

    // Bonus if move might land in bank (rough estimate)
    const distance = Math.abs(bankHole - hole);
    if (pebbles >= distance) {
      score += 10;
    }

    return { hole, score };
  });

  // Sort by score and pick the best
  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].hole;
}
