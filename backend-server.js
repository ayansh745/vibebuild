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

// Proxy endpoint for Gemini API
app.post('/api/generate-website', async (req, res) => {
  try {
    const { userPrompt, systemPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: 'userPrompt is required' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            maxOutputTokens: 8000,
          },
        }),
      }
    );

    const data = await response.json();

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
