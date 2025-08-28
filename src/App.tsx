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
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, images }),
        signal: controller.signal,
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
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Generation cancelled");
      } else {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-25">
          <h1 className="text-3xl font-bold text-white">
            AI Image Generator
          </h1>
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

            {loading ? (
              <div className="space-y-3">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                </button>
                <button
                  onClick={cancelGeneration}
                  className="w-full bg-red-800 hover:bg-red-700 text-white font-medium py-2 px-8 rounded-xl transition-all duration-200"
                >
                  Cancel Generation
                </button>
              </div>
            ) : (
              <button
                onClick={generate}
                disabled={loading || (!prompt.trim() && images.length === 0)}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                Generate Images
              </button>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <strong className="font-semibold">Error:</strong>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Generated Images
            </h3>
            {outputs.length === 0 ? (
              <div className="bg-neutral-950/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 text-lg">
                  Your generated images will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {outputs.map((out) => (
                  <div
                    key={out.filename}
                    className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group"
                  >
                    <div
                      className="relative overflow-hidden rounded-xl cursor-pointer"
                      onClick={() =>
                        setViewerImage(
                          `data:${out.mimeType};base64,${out.base64}`
                        )
                      }
                    >
                      <img
                        src={`data:${out.mimeType};base64,${out.base64}`}
                        className="w-full h-auto object-cover"
                        alt="Generated image"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>

                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <button
                        onClick={() =>
                          setViewerImage(
                            `data:${out.mimeType};base64,${out.base64}`
                          )
                        }
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </button>
                      <a
                        href={`data:${out.mimeType};base64,${out.base64}`}
                        download={out.filename}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
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
          <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
