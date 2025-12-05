import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { board, currentPlayer, player1Bank, player2Bank, direction, startingPebbles, difficulty } = await req.json()

    // Get valid moves for current player
    const playerHoles = currentPlayer === 1
      ? Array.from({length: 8}, (_, i) => i).filter(i => i !== player1Bank && board[i] > 0)
      : Array.from({length: 8}, (_, i) => i + 8).filter(i => i !== player2Bank && board[i] > 0)

    if (playerHoles.length === 0) {
      throw new Error('No valid moves available')
    }

    let suggestedMove: number

    // Easy mode: Random move
    if (difficulty === 'easy') {
      suggestedMove = playerHoles[Math.floor(Math.random() * playerHoles.length)]
    }
    // Medium/Hard mode: Use ChatGPT
    else {
      const bankHole = currentPlayer === 1 ? player1Bank : player2Bank

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
${board.map((count: number, i: number) => `Hole ${i}: ${count} pebbles${i === player1Bank ? ' (P1 Bank)' : i === player2Bank ? ' (P2 Bank)' : ''}`).join('\n')}

Current Player: Player ${currentPlayer}
Your bank: Hole ${bankHole}
Valid moves: Holes ${playerHoles.join(', ')}

${difficulty === 'hard' ? 'Play at EXPERT level. Prioritize:' : 'Play at INTERMEDIATE level. Consider:'}
1. Moves that trigger relays (landing in holes with 2+ pebbles)
2. Moves that get pebbles into your bank
3. Moves that set up future relay chains
4. Defensive moves to prevent opponent relays
5. Long-term strategic positioning

Respond with ONLY the hole number (just the number, nothing else).`

      try {
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

        if (!openaiApiKey) {
          throw new Error('OPENAI_API_KEY not configured')
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          })
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        suggestedMove = parseInt(data.choices[0].message.content.trim())

        // Validate the move
        if (!playerHoles.includes(suggestedMove)) {
          console.warn('AI suggested invalid move:', suggestedMove, 'Falling back to strategic')
          // Fallback to rule-based AI
          suggestedMove = getStrategicMove(board, playerHoles, bankHole)
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error)
        // Fallback to rule-based AI
        suggestedMove = getStrategicMove(board, playerHoles, bankHole)
      }
    }

    return new Response(
      JSON.stringify({ move: suggestedMove }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Strategic rule-based AI (fallback)
function getStrategicMove(board: number[], playerHoles: number[], bankHole: number): number {
  const scoredMoves = playerHoles.map(hole => {
    const pebbles = board[hole]
    let score = 0

    // Prefer moves with more pebbles (more likely to create relays)
    score += pebbles

    // Bonus if move might land in bank (rough estimate)
    const distance = Math.abs(bankHole - hole)
    if (pebbles >= distance) {
      score += 10
    }

    return { hole, score }
  })

  // Sort by score and pick the best
  scoredMoves.sort((a, b) => b.score - a.score)
  return scoredMoves[0].hole
}
