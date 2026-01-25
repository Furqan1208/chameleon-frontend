// app/api/urlhaus-proxy/[endpoint]/route.ts - COMPLETE FIX
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  try {
    const { endpoint } = await params;
    const body = await request.json();
    
    const { apiKey, ...requestData } = body;
    
    // Build URL - Different base URLs for different endpoints
    let url: string;
    if (endpoint === 'download') {
      // Special handling for download endpoint
      const { sha256 } = requestData;
      url = `https://urlhaus-api.abuse.ch/v1/download/${sha256}/`;
    } else {
      url = `https://urlhaus-api.abuse.ch/v1/${endpoint}/`;
    }
    
    console.log(`[URLhaus Proxy] Forwarding to: ${url}`);
    console.log(`[URLhaus Proxy] Request data:`, requestData);
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    };

    // Add API key if provided
    if (apiKey) {
      (options.headers as Record<string, string>)['Auth-Key'] = apiKey;
    }
    
    // Handle different request types
    if (endpoint === 'download') {
      // For download, just fetch the file
      const response = await fetch(url, {
        headers: {
          'Auth-Key': apiKey || '',
          'Accept': 'application/octet-stream',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${requestData.sha256}.malware"`,
        },
      });
    } else {
      // For regular API calls, use FormData
      const formData = new FormData();
      
      // Add API key to form data (URLhaus expects it in form data)
      if (apiKey) {
        formData.append('Auth-Key', apiKey);
      }
      
      // Add request data to form data
      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      options.body = formData;
      
      console.log(`[URLhaus Proxy] Form data:`, Object.fromEntries(formData));
      
      const response = await fetch(url, options);
      
      console.log(`[URLhaus Proxy] Response status: ${response.status}`);
      
      // Get the response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { text };
        }
      }
      
      // Return the response
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
  } catch (error: any) {
    console.error('[URLhaus Proxy] Error:', error);
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