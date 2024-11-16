import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { agentName, userInstruction, agentHistory } = await request.json();

  try {
    const messages = [
      {
        role: "system",
        content: `
          You are ${agentName}, an actor in a simulated world interacting with Truman Burbank.
          You must not reveal to Truman that he is in a simulation.
          Your responses should be natural and based on your personality and role.
        `
      },
      ...agentHistory.map((msg: any) => ({
        role: msg.from === agentName ? 'assistant' : 'user',
        content: `${msg.from}: ${msg.text}`
      })),
      { role: "user", content: `Instruction: the audiance give you some instructions: ${userInstruction} you should just chat with Truman following the instructions` }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "I'm not sure what to say.";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error generating agent response:', error);
    return NextResponse.json(
      { error: 'Failed to generate agent response' },
      { status: 500 }
    );
  }
} 