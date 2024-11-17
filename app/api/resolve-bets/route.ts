import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { bets, eventHistory, worldState } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Change this based on your preferred model
      messages: [
        {
          role: 'system',
          content: `You are the World AI of Truman World, responsible for resolving bets based on the current world state and recent events.
          Determine the outcome of each bet and return a JSON array with the following structure for each bet !!!ONLY RETURN JSON ARRAY!!!:
          [
            {
              "id": "bet_id",
              "success": true or false,
              "message": "Outcome message for the bet"
            }
          ]`
        },
        {
          role: 'user',
          content: `Resolve the following bets based on:
          Bets: ${JSON.stringify(bets)}
          Event History: ${JSON.stringify(eventHistory)}
          World State: ${JSON.stringify(worldState)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const responseText = completion.choices[0].message.content.trim();

    // Attempt to extract JSON from response
    const start = responseText.indexOf('[');
    const end = responseText.lastIndexOf(']');
    if (start === -1 || end === -1) {
      throw new Error('Response does not contain a valid JSON array');
    }

    const jsonString = responseText.slice(start, end + 1);
    const results = JSON.parse(jsonString);

    // Validate the JSON structure
    if (!Array.isArray(results)) {
      throw new Error('Parsed results are not a valid array');
    }

    return NextResponse.json({ results }, { status: 200 });

  } catch (error) {
    console.error('Error in resolve-bets:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve bets' },
      { status: 500 }
    );
  }
}
