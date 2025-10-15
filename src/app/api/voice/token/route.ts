import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to create ephemeral OpenAI Realtime tokens
 * This keeps the API key secure on the server side
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    // Get optional voice preference from request
    const body = await req.json().catch(() => ({}));
    const voice = body.voice || 'alloy';
    const model = body.model || 'gpt-4o-realtime-preview-2024-12-17';

    // Create ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        voice: voice,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to create ephemeral token:', error);
      return NextResponse.json(
        { error: `Failed to create token: ${error.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return only the client_secret (ephemeral token)
    // This token expires after a short time and is safe to use in browser
    return NextResponse.json({
      token: data.client_secret.value,
      expires_at: data.client_secret.expires_at
    });

  } catch (error) {
    console.error('❌ Error creating voice token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

