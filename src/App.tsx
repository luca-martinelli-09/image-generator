import { useState, useEffect } from "react";
import ImageUploader, { type UploadedImage } from "./components/ImageUploader";
import PromptEditor from "./components/PromptEditor";
import ImageViewer from "./components/ImageViewer";

interface OutputFile {
  mimeType: string;
  base64: string;
  filename: string;
}

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, images }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOutputs(data.outputs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">AI Image Generator</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with the power of AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <ImageUploader 
              images={images} 
              setImages={setImages} 
              onImageClick={setViewerImage}
            />
            <PromptEditor prompt={prompt} setPrompt={setPrompt} />

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-slate-600 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Images"
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <div>
                    <strong className="font-semibold">Error:</strong>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Generated Images
            </h3>
            {outputs.length === 0 ? (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Your generated images will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {outputs.map((out) => (
                  <div
                    key={out.filename}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-4 cursor-pointer" onClick={() => setViewerImage(`data:${out.mimeType};base64,${out.base64}`)}>
                      <img
                        src={`data:${out.mimeType};base64,${out.base64}`}
                        className="w-full h-auto object-cover"
                        alt="Generated image"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>
                    
                    <div className="absolute bottom-6 right-6 flex gap-2">
                      <button
                        onClick={() => setViewerImage(`data:${out.mimeType};base64,${out.base64}`)}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <a
                        href={`data:${out.mimeType};base64,${out.base64}`}
                        download={out.filename}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {viewerImage && (
          <ImageViewer 
            src={viewerImage} 
            onClose={() => setViewerImage(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
