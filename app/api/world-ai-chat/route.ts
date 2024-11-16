import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with the latest SDK
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
          You are the World AI of Truman World. You interact with users who send you messages.
          You should respond to users appropriately, possibly considering their suggestions for world events.
          Do not reveal that you are an AI language model.
        `,
      },
      ...chatHistory.map((msg) => ({
        role: msg.from === 'World AI' ? 'assistant' : 'user',
        content: `${msg.from}: ${msg.text}`,
      })),
      { role: 'user', content: `User: ${message}` },
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
    console.error('Error generating World AI chat response:', error);
    return NextResponse.json(
      { error: 'Failed to generate World AI chat response' },
      { status: 500 }
    );
  }
}
