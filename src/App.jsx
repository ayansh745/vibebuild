import {
  Sparkle,
  Lightning,
  ArrowUpRight,
  DownloadSimple,
  MagicWand,
  X,
  Eye,
} from "@phosphor-icons/react";

import { saveAs } from "file-saver";
import { useState } from "react";

import { generateWebsite } from "./services/generateWebsite";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedZip, setGeneratedZip] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [previewHTML, setPreviewHTML] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;

    try {
      setLoading(true);
      setCompleted(false);
      setShowPreview(false);

      const result = await generateWebsite(prompt);

      setGeneratedZip(result.blob);
      setPreviewHTML(result.previewHTML);
      setCompleted(true);
      setShowPreview(true);

      // Auto-download the zip
      setTimeout(() => {
        saveAs(result.blob, `website-${Date.now()}.zip`);
      }, 500);

    } catch (error) {
      console.error(error);
      let message = error.message || "Error generating website. Please try again.";
      
      // Better error messages for common issues
      if (message.includes('quota')) {
        message = "⚠️ API quota exceeded. Please enable billing on your Google Cloud project to continue.";
      } else if (message.includes('network') || message.includes('Failed to fetch')) {
        message = "❌ Could not reach the backend server. Make sure it's running (npm run server).";
      }
      
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedZip) return;
    saveAs(generatedZip, `website-${Date.now()}.zip`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_30%)]" />

      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-violet-600/20 blur-[180px]" />

      <div className="absolute bottom-[-250px] right-[-200px] w-[600px] h-[600px] bg-cyan-500/10 blur-[180px]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/10 backdrop-blur-3xl">

        <div className="flex items-center gap-4">

          <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-50" />

            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-2xl shadow-violet-500/30">
              <Lightning size={22} weight="fill" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight">
              vibe
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                build
              </span>
            </h1>

            <p className="text-xs text-zinc-500 mt-0.5">
              next generation website engine
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <Sparkle size={14} className="text-violet-400" />

          <span className="text-sm text-zinc-300">
            AI Website Generator
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-6 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-violet-500/10">

          <MagicWand size={15} className="text-violet-400" />

          <span className="text-sm text-zinc-300 tracking-wide">
            Create production ready websites instantly
          </span>
        </div>

        {/* Heading */}
        <h1 className="max-w-6xl text-5xl md:text-7xl lg:text-[96px] font-black leading-[0.92] tracking-tight">

          Build
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}beautiful{" "}
          </span>

          websites using
          <br />

          only prompts.
        </h1>

        {/* Sub */}
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-zinc-400 leading-relaxed">
          Generate elegant landing pages, startup websites, portfolios,
          SaaS interfaces and modern web experiences powered by AI.
        </p>

        {/* Prompt Container */}
        <div className="mt-16 w-full max-w-5xl relative">

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl rounded-[40px]" />

          {/* Main Card */}
          <div className="relative rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.12)]">

            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.03]">

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-500 tracking-wider">
                <Sparkle size={14} />
                vibebuild engine
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">

              {/* Textarea */}
              <div className="relative">

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Create a futuristic SaaS landing page with smooth animations, floating cards, glassmorphism and a premium startup feel..."
                  className="w-full h-44 md:h-52 bg-transparent resize-none outline-none text-lg md:text-xl text-white placeholder:text-zinc-600 leading-relaxed"
                />

                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Footer */}
              <div className="mt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

                {/* Suggestions */}
                <div className="flex flex-wrap gap-3">
                  {[
                    "SaaS",
                    "Portfolio",
                    "Startup",
                    "Agency",
                    "3D UI",
                    "Cyberpunk",
                  ].map((item) => (
                    <button
                      key={item}
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 text-sm text-zinc-300 hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                  {/* Preview */}
                  {completed && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="group px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 flex items-center gap-2"
                    >
                      <Eye
                        size={22}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="hidden sm:inline text-sm">Preview</span>
                    </button>
                  )}

                  {/* Generate */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 font-semibold text-white shadow-2xl shadow-violet-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                  >

                    <span className="relative z-10 flex items-center gap-2">

                      {loading
                        ? "Generating..."
                        : completed
                        ? "Generate Again"
                        : "Generate Website"}

                      <ArrowUpRight
                        size={18}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                      />
                    </span>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-300" />
                  </button>

                  {/* Download */}
                  {completed && (
                    <button
                      onClick={handleDownload}
                      className="group px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300"
                      title="Re-download project"
                    >
                      <DownloadSimple
                        size={22}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mt-8">

                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">

                    <div className="h-full w-1/2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full animate-pulse" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">

                    <span>
                      AI is crafting your website...
                    </span>

                    <span>
                      generating layout & styles
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </main>

      {/* Preview Modal */}
      {showPreview && previewHTML && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-3xl border border-white/20 bg-black shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-violet-400" />
                <div>
                  <h3 className="text-lg font-semibold">Website Preview</h3>
                  <p className="text-xs text-zinc-500">Press Escape or click X to close</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-white">
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full border-none"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03] flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                ✨ Your AI-generated website is ready! Download the full MERN stack project.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:scale-105 transition-transform"
                >
                  Download Project
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close preview on Escape key */}
      {showPreview && (
        <script>{`
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              window.dispatchEvent(new CustomEvent('closePreview'));
            }
          });
        `}</script>
      )}
    </div>
  );
}