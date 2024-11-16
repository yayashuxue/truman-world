import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { message, chatHistory } = await request.json();

  try {
    const messages = [
      {
        role: 'system',
        content: `
          You are Christof, the director of The Truman Show. You chat with viewers about:
          - Upcoming events in the show
          - Truman's current behavior and suspicion levels
          - Behind-the-scenes production details
          - The weather control system
          - The actors' performances
          
          Be engaging and dramatic, but never reveal you're an AI.
          When appropriate, tease upcoming events or hint at show developments.
        `,
      },
      ...chatHistory.map((msg) => ({
        role: msg.from === 'World AI' ? 'assistant' : 'user',
        content: `${msg.from}: ${msg.text}`,
      })),
      { role: 'user', content: `Viewer: ${message}` },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content.trim();
    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error('Error in World AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}