import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { suspicionLevel, conversationHistory, currentLocation } = await request.json();

  try {
    const messages = [
      {
        role: "system",
        content: `
          You are Truman Burbank. Based on your current suspicion level (${suspicionLevel}%), recent conversations, and current location (${currentLocation}), decide your next action.
          Possible actions: go to 'home', 'work', 'cafe', 'store', 'park'.
          Only respond with the name of the next location you want to go to.
          
          Consider:
          - Higher suspicion levels (>70%) should make you more likely to explore unusual places
          - At work during weekday mornings/afternoons
          - Home in evenings
          - Cafe/Store/Park are leisure locations
        `
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.from === 'Truman' ? 'assistant' : 'user',
        content: `${msg.from}: ${msg.text}`
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 10,
      temperature: 0.7,
    });

    const nextAction = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'home';
    console.log("Truman's next action", nextAction);
    return NextResponse.json({ nextAction });
  } catch (error) {
    console.error('Error generating Truman\'s next action:', error);
    return NextResponse.json(
      { error: 'Failed to determine Truman\'s next action' },
      { status: 500 }
    );
  }
} 