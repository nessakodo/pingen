import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract board ID from Pinterest URL
function extractBoardId(url: string): string | null {
  const match = url.match(/pin\.it\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    const { boardUrl, projectGoal, creativeTwist, imageText, visualStyle } = await request.json();

    if (!boardUrl || !projectGoal || !creativeTwist) {
      return NextResponse.json(
        { error: 'Board URL, project goal, and creative twist are required' },
        { status: 400 }
      );
    }

    // Extract board ID and fetch board content
    const boardId = extractBoardId(boardUrl);
    if (!boardId) {
      return NextResponse.json(
        { error: 'Invalid Pinterest board URL' },
        { status: 400 }
      );
    }

    // For now, we'll use the board content from the example
    const boardContent = {
      title: "jack in the box",
      description: "A collection of retro-inspired designs, typography, and festival posters",
      pins: [
        "Bright Tropical Sunset with Palm Trees and Ocean Waves",
        "Retro Pop Culture Typeface with Geometric Simplicity",
        "Colorful typography and retro designs",
        "Festival posters and event designs",
        "Memphis-style posters and furniture"
      ],
      hashtags: [
        "#illustration", "#sunset", "#beach", "#retro", "#modern",
        "#flatdesign", "#typography", "#graphicdesign", "#poster"
      ]
    };

    const systemPrompt = `You are a creative AI collaborator for Pinterest moodboards. Your task is to analyze a Pinterest board and generate new creative ideas based on the user's project goals and creative direction.

Given this Pinterest board content:
Title: ${boardContent.title}
Description: ${boardContent.description}
Main themes: ${boardContent.pins.join(', ')}
Popular hashtags: ${boardContent.hashtags.join(', ')}

Project Goal: "${projectGoal}"
Creative Twist: "${creativeTwist}"
${imageText ? `Text to include: "${imageText}"` : ''}
${visualStyle ? `Visual Style/Constraints: "${visualStyle}"` : ''}

Generate 3 unique image ideas that blend the board's aesthetic with the project goals and creative direction.

For each idea, provide:
1. A vivid image generation prompt (max 30 words) that will work well with DALL-E 3
2. A catchy pin title (max 8 words)
3. A poetic description (max 25 words)
4. 2-3 relevant hashtags

IMPORTANT: You must respond with a valid JSON object containing a "pins" array with exactly 3 objects. Each object must have these exact fields:
{
  "pins": [
    {
      "title": "string",
      "imagePrompt": "string",
      "description": "string",
      "hashtags": ["string"]
    }
  ]
}

Guidelines for image prompts:
- If text is provided, specify where it should appear and how it should look
- Include specific details about composition, lighting, and style
- Ensure the prompt aligns with the project goals
- Consider the visual style constraints if provided
- Make sure the prompt will generate a Pinterest-worthy image

Example response format:
{
  "pins": [
    {
      "title": "Pastel Memphis Vibes",
      "imagePrompt": "Festival crowd scene with Memphis-style patterns and pastel gradients, text 'Create Your Future Here' in bold sans-serif with neon outline",
      "description": "A vibrant festival scene blending retro Memphis patterns with soft pastel gradients",
      "hashtags": ["#FestivalDesign", "#PastelPop", "#MemphisStyle"]
    }
  ]
}`;

    const userPrompt = `Generate 3 unique ideas that blend the board's aesthetic with the project goals and creative direction. Remember to return a valid JSON object with a "pins" array containing exactly 3 objects.`;

    console.log('Making OpenAI API call for ideas...');
    
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
    } catch (_error) {
      console.log('gpt-4o failed, falling back to gpt-3.5-turbo');
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
    }

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', response);

    let pins;
    try {
      const parsedResponse = JSON.parse(response);
      console.log('Parsed response:', parsedResponse);
      
      // Ensure we have a pins array
      if (!parsedResponse.pins || !Array.isArray(parsedResponse.pins)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Response does not contain a pins array');
      }
      
      pins = parsedResponse.pins;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }

    // Generate images for each pin
    console.log('Generating images for pins...');
    interface PinBeforeImage {
      title: string;
      imagePrompt: string;
      description: string;
      hashtags: string[];
    }
    const pinsWithImages = await Promise.all(
      pins.map(async (pin: PinBeforeImage) => {
        try {
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: pin.imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "vivid"
          });

          return {
            ...pin,
            imageUrl: imageResponse.data[0].url
          };
        } catch (error) {
          console.error('Error generating image:', error);
          return {
            ...pin,
            imageUrl: null,
            imageError: 'Failed to generate image'
          };
        }
      })
    );

    return NextResponse.json({ pins: pinsWithImages });
  } catch (error) {
    console.error('Detailed error in remix API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 