import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageUrl, filename } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();
    
    const headers: Record<string, string> = {
      'Content-Type': 'image/png',
      'Content-Disposition': filename ? `attachment; filename="${encodeURIComponent(filename)}"` : 'attachment',
    };

    return new NextResponse(blob, {
      headers,
    });
  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to download image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 