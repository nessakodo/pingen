import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { boardUrl, twistPrompt } = await request.json();

    if (!boardUrl || !twistPrompt) {
      return NextResponse.json(
        { error: 'Board URL and twist prompt are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // For MVP, we'll use a simplified approach without direct Pinterest API access
    // In a production environment, you'd want to fetch the board's content here

    const systemPrompt = `You are a creative AI collaborator for Pinterest moodboards. Your task is to analyze a Pinterest board and generate new creative ideas based on the user's twist.

Given a Pinterest board URL and a user's creative twist, generate 4-6 unique image ideas that blend the board's aesthetic with the user's input.

For each idea, provide:
1. A vivid image generation prompt (max 30 words)
2. A catchy pin title (max 8 words)
3. A poetic description (max 25 words)
4. 3-5 relevant hashtags

Format each idea as a JSON object with these fields:
{
  "title": "string",
  "imagePrompt": "string",
  "description": "string",
  "hashtags": ["string"]
}

Return an array of these objects.`;

    const userPrompt = `Pinterest Board: ${boardUrl}
User's Creative Twist: ${twistPrompt}

Generate 4-6 unique ideas that blend the board's aesthetic with the user's twist.`;

    console.log('Making OpenAI API request...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      console.error('No response from OpenAI');
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    try {
      // Parse the response as JSON
      const pins = JSON.parse(response);
      return NextResponse.json({ pins });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in remix API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 