// app/api/threatfox-proxy/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { apiKey, ...threatfoxData } = body;
    
    // Build URL - ThreatFox API endpoint[citation:1]
    const url = 'https://threatfox-api.abuse.ch/api/v1/';
    
    console.log(`[ThreatFox Proxy] Forwarding to: ${url}`);
    console.log(`[ThreatFox Proxy] Request data:`, threatfoxData);
    console.log(`[ThreatFox Proxy] API Key present:`, !!apiKey);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // CRITICAL: Add API key to headers (not body)[citation:1]
    if (apiKey && apiKey.trim() !== '') {
      headers['Auth-Key'] = apiKey;
    } else {
      console.warn('[ThreatFox Proxy] No API key provided - using public access');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(threatfoxData),
    });
    
    console.log(`[ThreatFox Proxy] Response status: ${response.status}`);
    
    // Get the response
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error: any) {
    console.error('[ThreatFox Proxy] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Proxy error',
        query_status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}