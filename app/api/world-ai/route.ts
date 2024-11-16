import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { worldState, recentEvents } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
            You are the World AI controlling a simulated environment called Truman World.
            Your role is to introduce incidents and control the environment to make the simulation engaging.
            Based on the current world state and recent events, decide what should happen next.
            Provide a JSON response with the following structure:
            {
              "event": "Description of the event",
              "changes": {
                "weather": "...",
                "timeOfDay": "...",
                "currentEvent": "..."
              }
            }
          `
        },
        {
          role: 'user',
          content: `
            Current world state: ${JSON.stringify(worldState)}
            Recent events: ${JSON.stringify(recentEvents)}
          `
        }
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }
    console.log("World AI responseText", responseText);
    const worldAiResponse = JSON.parse(responseText);
    return NextResponse.json(worldAiResponse);

  } catch (error) {
    console.error('Error generating World AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate World AI response' },
      { status: 500 }
    );
  }
} 