# AI Website Builder

AI-powered website generator with MERN stack scaffolding, preview modal, and auto-download.

🌐 **Live**: https://ayanshdeshmukh210500-ai.github.io/ai-website-builder/

## Features

- ✨ Generate professional MERN stack websites with AI
- 👀 Live preview modal with iframe sandbox
- ⬇️ Auto-download complete project as ZIP
- 🔐 Secure API key management (backend proxy)
- 📱 Responsive design with Tailwind CSS
- 🚀 Production-ready code generation

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Phosphor Icons

**Backend:**
- Express.js
- Node.js

**API:**
- Google Gemini API

## Setup

### 1. Clone Repository
```bash
git clone https://github.com/ayanshdeshmukh210500-ai/ai-website-builder
cd ai-website-builder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file:
```bash
# Backend Configuration
GEMINI_API_KEY=your_api_key_here
PORT=5000

# Frontend Configuration
VITE_BACKEND_URL=http://localhost:5000
```

Get your API key from: https://aistudio.google.com/apikey

### 4. Local Development

**Terminal 1 - Start Backend:**
```bash
npm run server
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Production Deployment

### Frontend (GitHub Pages)
Already deployed to: https://ayanshdeshmukh210500-ai.github.io/ai-website-builder/

Deploy updates:
```bash
npm run deploy
```

### Backend (Vercel, Render, or Railway)

The `backend-server.js` needs to be deployed separately. Options:

#### Option 1: Vercel
```bash
vercel --prod
```

#### Option 2: Render
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables (GEMINI_API_KEY)
4. Deploy

#### Option 3: Railway
1. Create new project
2. Deploy from GitHub
3. Add environment variables
4. Get production URL

After deployment, update frontend's `VITE_BACKEND_URL` to the production backend URL.

## Usage

1. Enter a website description or choose a template
2. Click "Generate Website"
3. Preview the generated site in the modal
4. ZIP file auto-downloads with full MERN stack project
5. Extract and run locally:

```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
npm install
npm start
```

## Project Structure

```
.
├── src/
│   ├── App.jsx              # Main UI component
│   ├── services/
│   │   └── generateWebsite.js  # Frontend API client
│   └── index.css
├── backend-server.js        # Express server (API proxy)
├── public/
├── vite.config.js
└── package.json
```

## API Endpoints

- `POST /api/generate-website` - Generate website from prompt
- `GET /api/health` - Server health check

## Security

- ✅ API key stored on backend only
- ✅ Frontend build contains no secrets
- ✅ All API calls go through secure proxy
- ✅ Environment variables properly managed

## License

MIT
