import { useState } from "react";
import ImageUploader, { type UploadedImage } from "./components/ImageUploader";
import PromptEditor from "./components/PromptEditor";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">AI Image Generator</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with the power of AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <ImageUploader images={images} setImages={setImages} />
            <PromptEditor prompt={prompt} setPrompt={setPrompt} />

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                "✨ Generate Images"
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl backdrop-blur-sm">
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
            <h3 className="text-2xl font-semibold text-slate-800">
              Generated Images
            </h3>
            {outputs.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-slate-500 text-lg">
                  Your generated images will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {outputs.map((out) => (
                  <div
                    key={out.filename}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={`data:${out.mimeType};base64,${out.base64}`}
                        className="w-full h-auto object-cover"
                        alt="Generated image"
                      />
                    </div>
                    <a
                      href={`data:${out.mimeType};base64,${out.base64}`}
                      download={out.filename}
                      className="block text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      📥 Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
