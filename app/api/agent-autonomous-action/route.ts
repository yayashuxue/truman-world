import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AgentPersonality {
  [key: string]: {
    role: string;
    personality: string;
    agenda: string;
  };
}

const agentPersonalities: AgentPersonality = {
  Meryl: {
    role: "Wife",
    personality: "Product placement specialist, anxious when off-script",
    agenda: "Must promote products naturally while maintaining relationship with Truman"
  },
  Marlon: {
    role: "Best Friend",
    personality: "Crisis manager, laid back but always watchful",
    agenda: "Keep Truman from discovering the truth while being a supportive friend"
  }
};

export async function POST(request: Request) {
  const { agentName, agentHistory } = await request.json();
  const personality = agentPersonalities[agentName];

  try {
    const messages = [
      {
        role: "system",
        content: `
          You are ${agentName}, playing the role of ${personality.role} in Truman's life.
          Personality: ${personality.personality}
          Current Agenda: ${personality.agenda}

          Generate a natural interaction with Truman based on your role and agenda.
          Keep responses brief and conversational.
          Never reveal the artificial nature of Truman's world.
        `
      },
      ...agentHistory.map((msg: any) => ({
        role: msg.from === agentName ? 'assistant' : 'user',
        content: `${msg.from}: ${msg.text}`
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "Hey Truman!";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error generating agent autonomous message:', error);
    return NextResponse.json(
      { error: 'Failed to generate agent autonomous message' },
      { status: 500 }
    );
  }
} 