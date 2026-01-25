// app/api/hybrid-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const hash = searchParams.get('hash');
    const jobId = searchParams.get('jobId'); // New parameter for job ID
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.HYBRID_ANALYSIS_API_KEY || process.env.NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Hybrid Analysis API key not configured' },
        { status: 500 }
      );
    }

    let url: string;
    
    // Construct the URL based on the endpoint
    switch (endpoint) {
      case 'search-hash':
        if (!hash) {
          return NextResponse.json(
            { error: 'Hash parameter is required for search-hash endpoint' },
            { status: 400 }
          );
        }
        url = `https://www.hybrid-analysis.com/api/v2/search/hash?hash=${encodeURIComponent(hash)}`;
        break;
        
      case 'overview':
        if (!hash) {
          return NextResponse.json(
            { error: 'Hash parameter is required for overview endpoint' },
            { status: 400 }
          );
        }
        url = `https://www.hybrid-analysis.com/api/v2/overview/${hash}`;
        break;
        
      case 'overview-summary':
        if (!hash) {
          return NextResponse.json(
            { error: 'Hash parameter is required for overview-summary endpoint' },
            { status: 400 }
          );
        }
        url = `https://www.hybrid-analysis.com/api/v2/overview/${hash}/summary`;
        break;
        
      case 'feed-detonation':
        url = 'https://www.hybrid-analysis.com/api/v2/feed/detonation';
        break;
        
      case 'feed-quick-scan':
        url = 'https://www.hybrid-analysis.com/api/v2/feed/quick-scan';
        break;
        
      case 'report-summary':
        // The report-summary endpoint needs jobId, not just hash
        if (!jobId && !hash) {
          return NextResponse.json(
            { error: 'Job ID or Hash parameter is required for report-summary endpoint' },
            { status: 400 }
          );
        }
        // Use jobId if provided, otherwise use hash
        const reportId = jobId || hash;
        url = `https://www.hybrid-analysis.com/api/v2/report/${reportId}/summary`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    console.log(`[API Proxy] Calling Hybrid Analysis: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'User-Agent': 'Falcon Sandbox',
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Proxy] Hybrid Analysis API error ${response.status}: ${errorText}`);
      
      // Return appropriate error messages
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Report not found. The job ID or hash may be invalid or the report may have expired.' },
          { status: 404 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Invalid API key or insufficient permissions.' },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: `API error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Forward rate limit headers
    const headers = new Headers();
    if (response.headers.has('api-limits')) {
      headers.set('api-limits', response.headers.get('api-limits')!);
    }
    if (response.headers.has('api-version')) {
      headers.set('api-version', response.headers.get('api-version')!);
    }
    if (response.headers.has('webservice-version')) {
      headers.set('webservice-version', response.headers.get('webservice-version')!);
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Hybrid Analysis proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Hybrid Analysis API. Please check your network connection.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.HYBRID_ANALYSIS_API_KEY || process.env.NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Hybrid Analysis API key not configured' },
        { status: 500 }
      );
    }

    let url: string;
    const body = await request.json();
    
    // Construct the URL based on the endpoint
    switch (endpoint) {
      case 'search-hashes':
        url = 'https://www.hybrid-analysis.com/api/v2/search/hashes';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'User-Agent': 'Falcon Sandbox',
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Forward rate limit headers
    const headers = new Headers();
    if (response.headers.has('api-limits')) {
      headers.set('api-limits', response.headers.get('api-limits')!);
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Hybrid Analysis proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Hybrid Analysis API' },
      { status: 500 }
    );
  }
}