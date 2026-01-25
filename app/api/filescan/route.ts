import { NextRequest, NextResponse } from 'next/server';

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

    const apiKey = process.env.NEXT_PUBLIC_FILESCAN_API_KEY;
    
    if (!apiKey) {
      console.error('[Filescan] API key not configured');
      return NextResponse.json(
        { error: 'Filescan API key not configured' },
        { status: 500 }
      );
    }

    let url: string;
    let body: any;
    let contentType = 'multipart/form-data';
    
    console.log(`[Filescan] POST request to endpoint: ${endpoint}`);
    
    switch (endpoint) {
      case 'scan-file':
        url = 'https://www.filescan.io/api/scan/file';
        body = await request.formData();
        break;
        
      case 'scan-url':
        url = 'https://www.filescan.io/api/scan/url';
        const formData = await request.formData();
        body = new URLSearchParams();
        
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            // Convert File to string if needed
            body.append(key, await value.text());
          } else {
            body.append(key, value.toString());
          }
        }
        
        contentType = 'application/x-www-form-urlencoded';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    const headers: HeadersInit = {
      'X-Api-Key': apiKey,
      'accept': 'application/json',
    };

    // Set Content-Type based on endpoint
    if (endpoint === 'scan-url') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // For multipart/form-data (scan-file), let the browser set the boundary

    console.log(`[Filescan] Making ${endpoint} request to Filescan API`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`[Filescan] API Error ${response.status}:`, errorText);
        
        // Try to parse as JSON for structured error
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.detail || errorData.error || errorData.message || `API error ${response.status}`;
          return NextResponse.json(
            { error: errorMessage },
            { status: response.status }
          );
        } catch {
          // If not JSON, use raw text
          return NextResponse.json(
            { error: errorText || `API error ${response.status}` },
            { status: response.status }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `Filescan API error ${response.status}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log(`[Filescan] ${endpoint} successful`);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Filescan] Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FILESCAN_API_KEY;
    
    if (!apiKey) {
      console.error('[Filescan] API key not configured');
      return NextResponse.json(
        { error: 'Filescan API key not configured' },
        { status: 500 }
      );
    }

    let url: string;
    const queryParams = new URLSearchParams();
    
    console.log(`[Filescan] GET request to endpoint: ${endpoint}`);
    
    // Handle different endpoints
    switch (endpoint) {
      case 'scan-status':
        const flowId = searchParams.get('flowId');
        if (!flowId) {
          return NextResponse.json(
            { error: 'Flow ID is required' },
            { status: 400 }
          );
        }
        url = `https://www.filescan.io/api/scan/${flowId}/report`;
        
        // Handle filter parameter
        const filter = searchParams.get('filter');
        if (filter) {
          // For arrays, Filescan expects JSON stringified array
          if (filter.includes(',')) {
            // Multiple filters - treat as array
            const filterArray = filter.split(',').map(f => f.trim());
            queryParams.set('filter', JSON.stringify(filterArray));
          } else {
            // Single filter
            queryParams.set('filter', filter);
          }
        }
        
        // Handle other optional parameters
        const sorting = searchParams.get('sorting');
        if (sorting) queryParams.set('sorting', sorting);
        
        const other = searchParams.get('other');
        if (other) queryParams.set('other', other);
        
        break;
        
      case 'report':
        const reportId = searchParams.get('reportId');
        const fileHash = searchParams.get('fileHash');
        if (!reportId || !fileHash) {
          return NextResponse.json(
            { error: 'Report ID and File Hash are required' },
            { status: 400 }
          );
        }
        url = `https://www.filescan.io/api/reports/${reportId}/${fileHash}`;
        
        // Handle report filter
        const reportFilter = searchParams.get('filter');
        if (reportFilter) {
          if (reportFilter.includes(',')) {
            const filterArray = reportFilter.split(',').map(f => f.trim());
            queryParams.set('filter', JSON.stringify(filterArray));
          } else {
            queryParams.set('filter', reportFilter);
          }
        }
        
        // Handle report-specific parameters
        const reportSorting = searchParams.get('sorting');
        if (reportSorting) queryParams.set('sorting', reportSorting);
        
        const reportOther = searchParams.get('other');
        if (reportOther) queryParams.set('other', reportOther);
        
        break;
        
      case 'report-files':
        const filesReportId = searchParams.get('reportId');
        if (!filesReportId) {
          return NextResponse.json(
            { error: 'Report ID is required' },
            { status: 400 }
          );
        }
        url = `https://www.filescan.io/api/reports/${filesReportId}/files`;
        
        // Handle type parameter
        const type = searchParams.get('type') || 'all';
        queryParams.set('type', type);
        
        // Handle with_content parameter
        const withContent = searchParams.get('with_content');
        if (withContent) queryParams.set('with_content', withContent);
        
        break;
        
      case 'file-content':
        const hash = searchParams.get('hash');
        if (!hash) {
          return NextResponse.json(
            { error: 'File hash is required' },
            { status: 400 }
          );
        }
        url = `https://www.filescan.io/api/files/${hash}`;
        
        // Handle type parameter
        const fileType = searchParams.get('type') || 'base64';
        queryParams.set('type', fileType);
        
        // Handle other file content parameters
        const contentReportId = searchParams.get('reportId');
        if (contentReportId) queryParams.set('report_id', contentReportId);
        
        const originalName = searchParams.get('original_name');
        if (originalName) queryParams.set('original_name', originalName);
        
        const password = searchParams.get('password');
        if (password) queryParams.set('password', password);
        
        break;
        
      case 'pe-emulation':
        const peReportId = searchParams.get('reportId');
        const fileName = searchParams.get('fileName') || 'symbols.json';
        
        if (!peReportId) {
          return NextResponse.json(
            { error: 'Report ID is required for PE emulation' },
            { status: 400 }
          );
        }
        
        if (!['symbols.json', 'api_log.json'].includes(fileName)) {
          return NextResponse.json(
            { error: 'Invalid file name. Must be symbols.json or api_log.json' },
            { status: 400 }
          );
        }
        
        url = `https://www.filescan.io/api/files/pe-emulation/${peReportId}/${fileName}`;
        break;
        
      case 'similarity-search':
        url = 'https://www.filescan.io/api/similarity-search/similarity';
        
        // Handle similarity search parameters
        const searchHash = searchParams.get('hash');
        if (searchHash) queryParams.set('hash', searchHash);
        
        const minSimilarity = searchParams.get('minSimilarity') || '0';
        queryParams.set('min_similarity', minSimilarity);
        
        const verdict = searchParams.get('verdict');
        if (verdict) queryParams.set('verdict', verdict);
        
        // Handle tags parameter (array)
        const tagsParam = searchParams.get('tags');
        if (tagsParam) {
          try {
            // Check if it's already JSON
            JSON.parse(tagsParam);
            queryParams.set('tags', tagsParam);
          } catch {
            // If not JSON, assume it's a comma-separated list
            const tagsArray = tagsParam.split(',').map(t => t.trim()).filter(t => t);
            if (tagsArray.length > 0) {
              queryParams.set('tags', JSON.stringify(tagsArray));
            }
          }
        }
        
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    // Build the final URL with query parameters
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    console.log(`[Filescan] Calling external API: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`[Filescan] API Error ${response.status}:`, errorText);
        
        // Special handling for 404 errors
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Resource not found. The report or scan may have been deleted or does not exist.' },
            { status: 404 }
          );
        }
        
        // Special handling for 422 errors (validation)
        if (response.status === 422) {
          try {
            const errorData = JSON.parse(errorText);
            const errorMessage = errorData.detail || errorData.error || 'Validation error';
            return NextResponse.json(
              { error: errorMessage },
              { status: 422 }
            );
          } catch {
            return NextResponse.json(
              { error: 'Validation error' },
              { status: 422 }
            );
          }
        }
        
        // Try to parse error as JSON
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.detail || errorData.error || errorData.message || `API error ${response.status}`;
          return NextResponse.json(
            { error: errorMessage },
            { status: response.status }
          );
        } catch {
          // If not JSON, use raw text
          return NextResponse.json(
            { error: errorText || `API error ${response.status}` },
            { status: response.status }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `Filescan API error ${response.status}` },
          { status: response.status }
        );
      }
    }

    // Handle different content types
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      // Add debug info for certain endpoints
      if (endpoint === 'scan-status') {
        console.log(`[Filescan] ${endpoint} successful. Has reports: ${data.reports ? 'yes' : 'no'}`);
      } else if (endpoint === 'report') {
        console.log(`[Filescan] ${endpoint} successful. Reports keys: ${data.reports ? Object.keys(data.reports).join(', ') : 'none'}`);
      } else {
        console.log(`[Filescan] ${endpoint} successful`);
      }
      
      return NextResponse.json(data);
    } else if (contentType?.includes('text/plain') || endpoint === 'pe-emulation') {
      // Handle text responses (like PE emulation files)
      const text = await response.text();
      console.log(`[Filescan] ${endpoint} successful (text response)`);
      return NextResponse.json({ data: text });
    } else {
      // Handle other content types
      const buffer = await response.arrayBuffer();
      console.log(`[Filescan] ${endpoint} successful (binary response)`);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
        },
      });
    }
    
  } catch (error) {
    console.error('[Filescan] Proxy error:', error);
    
    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Network error: Unable to connect to Filescan API. Please check your internet connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}