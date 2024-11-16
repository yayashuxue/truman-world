// app/api/generate-response/route.js

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { actorName, action, conversationHistory } = await request.json();

    // Create the prompt for GPT
    const prompt = `You are Truman Burbank from The Truman Show. You are not supposed to know that you are in a simulation. ${actorName} just said to you: "${action}". How do you respond? Keep the response natural and in-character.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        ...conversationHistory.map((msg: any) => ({
          role: msg.from === "Truman" ? "assistant" : "user",
          content: msg.text
        }))
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
