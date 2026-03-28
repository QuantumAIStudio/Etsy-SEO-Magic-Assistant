export async function onRequest(context: any) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed. Please use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Clone the request to read the body
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const prompt = body.prompt || body.text || body.message;

  const WORKER_URLS = [
    'https://aiworker.psychicworld2012.workers.dev',
    'https://aiworker.psychicworld2012.workers.dev/',
  ];

  let lastError = 'No workers attempted';

  for (const baseUrl of WORKER_URLS) {
    try {
      const body = { 
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Etsy SEO Consultant. You MUST provide exactly 13 SEO tags in your response. This is a non-negotiable requirement for Etsy shop optimisation. Use Australian English spelling (e.g., "optimise", "optimisation").' 
          },
          { role: 'user', content: prompt }
        ] 
      };

      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream, application/json',
          },
          body: JSON.stringify(body),
        });

        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        
        if (contentType.includes('text/html') || text.toLowerCase().includes('<html')) {
          continue;
        }

        if (response.ok) {
          if (contentType.includes('text/event-stream') || text.includes('data:')) {
            let fullResponse = '';
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  fullResponse += data.response || data.text || data.content || '';
                } catch {
                  fullResponse += dataStr;
                }
              }
            }
            if (fullResponse) {
              return new Response(JSON.stringify({ response: fullResponse }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }

          try {
            return new Response(JSON.stringify(JSON.parse(text)), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch {
            if (text.length > 5) {
              return new Response(JSON.stringify({ response: text }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        } else {
          try {
            const json = JSON.parse(text);
            lastError = `Worker error: ${json.error || text}`;
          } catch {
            lastError = `Worker returned ${response.status}: ${text.substring(0, 50)}`;
          }
        }
      } catch (e) {
        lastError = `Connection Error: ${e instanceof Error ? e.message : 'Unknown'}`;
      }
    } catch (error) {
      lastError = `Critical failure for ${baseUrl}`;
    }
  }

  return new Response(JSON.stringify({ 
    error: 'AI Connection Failed', 
    details: lastError,
    suggestion: 'Check your Cloudflare Worker deployment and URL.'
  }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' }
  });
};
