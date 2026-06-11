import JSZip from "jszip";

// Use relative path for API calls - Vite dev server will proxy to backend
const BACKEND_URL = '/api';

const SYSTEM_PROMPT = `
You are an elite MERN stack architect and frontend developer.

CRITICAL: Generate VALID JSON ONLY. No extra text, no markdown, no explanations.

Return ONLY this JSON structure (keep code in strings SIMPLE and SHORT):
{
  "html": "<div>HTML here with no unescaped quotes</div>",
  "css": "body { margin: 0; }",
  "js": "console.log('Hello');",
  "serverJs": "import express from 'express';\\nconst app = express();",
  "packageJson": {"name": "website", "version": "1.0.0", "dependencies": {}},
  "envExample": "BACKEND_URL=http://localhost:5000",
  "readmeInfo": "# Setup\\nInstall and run"
}

Keep it simple - focus on the structure, not verbose code.
`;

// Helper function to safely parse JSON with error recovery
function attemptJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    // Try to fix common issues
    let fixed = jsonString;
    
    // Handle unescaped newlines within string values
    // Match patterns like: "key": "value with
    // newline" and escape them
    fixed = fixed.replace(/":\s*"([^"]*\n[^"]*)/g, (match) => {
      return match.replace(/\n/g, '\\n');
    });
    
    // Handle unescaped backslashes before quotes
    fixed = fixed.replace(/([^\\])(\\{0})"/g, '$1\\"');
    
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      throw new Error(`JSON repair failed: ${e.message}`);
    }
  }
}

export async function generateWebsite(userPrompt) {
  try {

    // API CALL TO BACKEND PROXY
    const response = await fetch(
      `${BACKEND_URL}/generate-website`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userPrompt,
          systemPrompt: SYSTEM_PROMPT,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Server error (${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log(data);

    // Check if response has error field (from Gemini)
    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    // RAW AI RESPONSE
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("No response from AI - API returned empty response. Make sure your API key has quota available.");
    }

    // CLEAN RESPONSE - Remove markdown formatting
    let cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[\s\S]*?\{/, "{")  // Remove any text before first {
      .replace(/\}[\s\S]*$/, "}")   // Remove any text after last }
      .trim();

    // PARSE JSON with recovery
    let website;
    try {
      website = attemptJsonParse(cleaned);
    } catch (parseError) {
      console.error('JSON Parse Error Details:');
      console.error('Error:', parseError.message);
      console.error('Cleaned length:', cleaned.length);
      console.error('First 300 chars:', cleaned.substring(0, 300));
      console.error('Last 300 chars:', cleaned.substring(Math.max(0, cleaned.length - 300)));
      
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}. Try a different or simpler prompt.`);
    }

    // ZIP FOR FULL PROJECT
    const zip = new JSZip();

    // FRONTEND FOLDER
    const frontend = zip.folder("frontend");

    // HTML
    frontend.file(
      "index.html",
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Generated Website</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
${website.html}
<script src="script.js"><\/script>
</body>
</html>`
    );

    // CSS
    frontend.file("style.css", website.css);

    // JS
    frontend.file("script.js", website.js);

    // Frontend package.json
    frontend.file(
      "package.json",
      JSON.stringify({
        name: "ai-generated-website",
        version: "1.0.0",
        description: "AI Generated MERN Stack Website",
        type: "module",
        scripts: {
          start: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {},
        devDependencies: {
          vite: "^4.0.0"
        }
      }, null, 2)
    );

    // BACKEND FOLDER
    const backend = zip.folder("backend");

    // Server file with MERN structure
    const serverCode = website.serverJs || `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/api/data', (req, res) => {
  res.json({
    message: 'Welcome to AI Generated MERN Stack',
    data: {
      features: ['Responsive Design', 'Modern UI', 'Fast Performance'],
      version: '1.0.0'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`;

    backend.file("server.js", serverCode);

    // Backend package.json
    backend.file(
      "package.json",
      JSON.stringify({
        name: "ai-generated-backend",
        version: "1.0.0",
        description: "AI Generated MERN Stack Backend",
        type: "module",
        main: "server.js",
        scripts: {
          start: "node server.js",
          dev: "nodemon server.js"
        },
        dependencies: {
          express: "^4.18.2",
          cors: "^2.8.5",
          dotenv: "^16.0.3"
        },
        devDependencies: {
          nodemon: "^2.0.20"
        }
      }, null, 2)
    );

    // .env.example
    backend.file(
      ".env.example",
      `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-website
JWT_SECRET=your_jwt_secret_key_here
API_KEY=your_api_key_here`
    );

    // .gitignore
    zip.file(
      ".gitignore",
      `node_modules/
.env
.env.local
.DS_Store
dist/
build/
*.log
.vscode/
.idea/`
    );

    // README
    const readmeContent = website.readmeInfo || `## Features
- Modern, responsive design
- Production-ready code
- Full MERN stack setup
- Professional UI/UX

## Installation

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
npm start
\`\`\`

## API Endpoints
- \`GET /api/health\` - Server health check
- \`GET /api/data\` - Get application data

## Deployment
Ready to deploy on Vercel, Netlify, or any Node.js hosting.

## License
MIT`;

    zip.file(
      "README.md",
      "# AI Generated MERN Stack Website\n\n" + readmeContent
    );

    // GENERATE ZIP
    const blob = await zip.generateAsync({
      type: "blob",
    });

    // Create preview HTML as string concatenation
    const previewHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Generated Website Preview</title><style>' + website.css + '</style></head><body>' + website.html + '<script>' + website.js + '</script></body></html>';

    // Return both blob and preview HTML
    return {
      blob,
      previewHTML
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
}