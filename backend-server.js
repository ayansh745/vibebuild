import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local or .env
dotenv.config({ path: join(__dirname, '.env.local') });
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set');
  console.error('Please create a .env.local file with: GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

// Retry logic for handling temporary API failures (503, "high demand" errors)
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // If no error in response, return it
      if (!data.error) {
        return data;
      }
      
      // Check if it's a retriable error (503, high demand, rate limit)
      const isRetriable = 
        response.status === 503 || 
        data.error.status === 'RESOURCE_EXHAUSTED' ||
        data.error.code === 503 ||
        (data.error.message && data.error.message.includes('currently experiencing high demand'));
      
      if (!isRetriable) {
        // Not retriable, return the error immediately
        return data;
      }
      
      lastError = data;
      
      // If this was the last attempt, return the error
      if (attempt === maxRetries) {
        return data;
      }
      
      // Exponential backoff: 1s, 3s, 5s between retries
      const delayMs = (attempt * 2 - 1) * 1000;
      console.log(`Attempt ${attempt} failed with high demand error. Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delayMs = (attempt * 2 - 1) * 1000;
      console.log(`Attempt ${attempt} network error. Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
};

// Proxy endpoint for Gemini API
app.post('/api/generate-website', async (req, res) => {
  try {
    const { userPrompt, systemPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: 'userPrompt is required' });
    }

    const data = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 16000,
          },
        }),
      }
    );

    // Check if Gemini API returned an error
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      
      // Check for quota errors
      if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
        return res.status(429).json({ 
          error: 'API quota exceeded. Please enable billing on your Google Cloud project or try again later.' 
        });
      }
      
      // Return other API errors
      return res.status(data.error.code || 500).json({ 
        error: `API Error: ${data.error.message}` 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: `Failed to generate website: ${error.message}` });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
