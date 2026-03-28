import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy Route to bypass CORS
  app.post('/api/generate', async (req, res) => {
    const WORKER_URLS = [
      'https://aiworker.psychicworld2012.workers.dev',
      'https://aiworker.psychicworld2012.workers.dev/',
    ];
    
    const prompt = req.body.prompt || req.body.text || req.body.message;
    console.log(`[Proxy] Request for: ${prompt?.substring(0, 50)}...`);
    
    let lastError = 'No workers attempted';

    for (const baseUrl of WORKER_URLS) {
      try {
        console.log(`[Proxy] Testing: ${baseUrl}`);
        
        // Match your worker's expected format: { messages: [...] }
        const body = { 
          messages: [
            { role: 'system', content: 'You are an expert Etsy SEO Consultant. Provide high-quality, professional Etsy listings.' },
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
            signal: AbortSignal.timeout(15000) // Increased timeout for streaming
          });

          const contentType = response.headers.get('content-type') || '';
          const text = await response.text();
          
          if (contentType.includes('text/html') || text.toLowerCase().includes('<html')) {
            continue;
          }

          if (response.ok) {
            // Handle the text/event-stream format from your worker
            if (contentType.includes('text/event-stream') || text.includes('data:')) {
              console.log(`[Proxy] Parsing stream from ${baseUrl}`);
              let fullResponse = '';
              const lines = text.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6).trim();
                  if (dataStr === '[DONE]') continue;
                  try {
                    const data = JSON.parse(dataStr);
                    // Llama 3.1 on Cloudflare typically returns { response: "..." } or { text: "..." }
                    fullResponse += data.response || data.text || data.content || '';
                  } catch (e) {
                    // If it's not JSON, it might be raw text
                    fullResponse += dataStr;
                  }
                }
              }
              
              if (fullResponse) {
                return res.status(200).json({ response: fullResponse });
              }
            }

            // Fallback for standard JSON
            try {
              return res.status(200).json(JSON.parse(text));
            } catch {
              if (text.length > 5) return res.status(200).json({ response: text });
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

    console.error(`[Proxy] ALL ATTEMPTS FAILED. Last error: ${lastError}`);
    res.status(502).json({ 
      error: 'AI Connection Failed', 
      details: lastError,
      suggestion: 'Ensure your Cloudflare Worker is deployed and the URL is correct.'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
