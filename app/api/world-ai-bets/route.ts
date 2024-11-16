import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { worldState, recentEvents } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // You can switch to "gpt-4-turbo-preview" or your preferred model
      messages: [
        {
          role: 'system',
          content: `You are the World AI of Truman World, responsible for generating engaging betting opportunities.
          Create bets that are relevant to the current world state and recent events.
          Return only a single JSON object with the following structure:
          {
            "id": "unique_string",
            "question": "Interesting bet question based on current events",
            "options": ["Option 1", "Option 2"],
            "endTime": "Time duration (e.g., '1 hour', '30 minutes')",
            "pool": "Initial pool amount in USDC",
            "odds": {"Option 1": "numerical_odds", "Option 2": "numerical_odds"}
          }`
        },
        {
          role: 'user',
          content: `Generate a new bet based on:
          World State: ${JSON.stringify(worldState)}
          Recent Events: ${JSON.stringify(recentEvents)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }  // Ensure JSON response
    });

    const responseText = completion.choices[0].message.content;
    console.log("World AI bets responseText", responseText);
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse and validate the bet
    const bet = JSON.parse(responseText);
    
    // Basic validation
    if (!bet.question || !bet.options || !bet.endTime || !bet.odds) {
      throw new Error('Invalid bet format received from AI');
    }

    return NextResponse.json({ bet }, { status: 200 });

  } catch (error) {
    console.error('Error in world-ai-bets:', error);
    return NextResponse.json(
      { error: 'Failed to generate bet' },
      { status: 500 }
    );
  }
} 