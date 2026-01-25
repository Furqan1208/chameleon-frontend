// app/api/abuseipdb-proxy/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  try {
    const { endpoint } = await params;
    const { params: queryParams, apiKey } = await request.json();
    
    // Build URL
    const url = new URL(`https://api.abuseipdb.com/api/v2/${endpoint}`);
    
    // Add query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    console.log(`[Proxy] Forwarding to: ${url.toString()}`);
    
    // Forward the request
    const response = await fetch(url.toString(), {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
    });
    
    // Get the response
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error: any) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  // For GET requests, you can handle differently or just use POST
  return NextResponse.json(
    { error: 'Use POST method for proxy requests' },
    { status: 405 }
  );
}