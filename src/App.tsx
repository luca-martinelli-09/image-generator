import { useCallback, useEffect, useState } from "react";
import ImageUploader, { type UploadedImage } from "./components/ImageUploader";
import ImageViewer from "./components/ImageViewer";
import PromptEditor from "./components/PromptEditor";
import { indexedDBStorage } from "./utils/indexedDB";

interface OutputFile {
  mimeType: string;
  base64: string;
  filename: string;
}

interface ProjectData {
  prompt: string;
  images: UploadedImage[];
  timestamp: number;
}

interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  images: UploadedImage[];
  outputs?: OutputFile[];
  timestamp: number;
}

interface ErrorData {
  code?: string;
  suggestion?: string;
  retryable?: boolean;
}

interface EnhancedError extends Error {
  errorData?: ErrorData;
}

function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<ErrorData | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [modalClosing, setModalClosing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Load saved project on mount
    const saved = localStorage.getItem("image-generator-project");
    if (saved) {
      try {
        const projectData: ProjectData = JSON.parse(saved);
        setPrompt(projectData.prompt || "");
        setImages(projectData.images || []);
      } catch (error) {
        console.error("Failed to load saved project:", error);
      }
    }

    // Load saved prompts from IndexedDB
    const loadSavedPrompts = async () => {
      try {
        const prompts = await indexedDBStorage.getAllPrompts();
        setSavedPrompts(prompts);
      } catch (error) {
        console.error("Failed to load saved prompts from IndexedDB:", error);
        // Fallback to localStorage if IndexedDB fails
        try {
          const savedPromptsData = localStorage.getItem(
            "image-generator-saved-prompts"
          );
          if (savedPromptsData) {
            const localPrompts = JSON.parse(savedPromptsData);
            setSavedPrompts(localPrompts);
            // Migrate to IndexedDB
            for (const prompt of localPrompts) {
              try {
                await indexedDBStorage.savePrompt(prompt);
              } catch (err) {
                console.error("Failed to migrate prompt to IndexedDB:", err);
              }
            }
            // Clear localStorage after migration
            localStorage.removeItem("image-generator-saved-prompts");
          }
        } catch (localStorageError) {
          console.error(
            "Failed to load from localStorage fallback:",
            localStorageError
          );
        }
      }
    };

    loadSavedPrompts();
  }, []);

  // Auto-save to localStorage when prompt or images change
  useEffect(() => {
    const projectData: ProjectData = {
      prompt,
      images,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      "image-generator-project",
      JSON.stringify(projectData)
    );
  }, [prompt, images]);

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
        const errorData = await res.json();
        const error: EnhancedError = new Error(
          errorData.error || `Server error: ${res.status}`
        );
        error.errorData = errorData;
        throw error;
      }

      const data = await res.json();

      if (data.error) {
        const error: EnhancedError = new Error(data.error);
        error.errorData = data;
        throw error;
      }

      setOutputs(data.outputs || []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Generation cancelled");
        setErrorDetails(null);
      } else if (err instanceof Error) {
        // Check if this error has enhanced error data from server
        const enhancedError = err as EnhancedError;
        if (enhancedError.errorData) {
          setError(err.message);
          setErrorDetails({
            code: enhancedError.errorData.code,
            suggestion: enhancedError.errorData.suggestion,
            retryable: enhancedError.errorData.retryable,
          });
        } else {
          // Handle network/fetch errors
          if (
            err.message.includes("fetch") ||
            err.message.includes("network")
          ) {
            setError("Network error. Please check your connection.");
            setErrorDetails({
              suggestion: "Verify your internet connection and try again.",
              retryable: true,
            });
          } else {
            setError(err.message);
            setErrorDetails(null);
          }
        }
      } else {
        setError("Unknown error occurred");
        setErrorDetails(null);
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

  const loadProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData: ProjectData = JSON.parse(e.target?.result as string);
        setPrompt(projectData.prompt || "");
        setImages(projectData.images || []);
        setError("");
      } catch (error: unknown) {
        console.log(error);
        setError("Failed to load project file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find((file) => file.type === "application/json");

    if (jsonFile) {
      loadProject(jsonFile);
    } else {
      setError("Please drop a valid JSON project file.");
    }
  };

  const saveCurrentPrompt = () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt before saving.");
      return;
    }

    const defaultTitle =
      prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;

    setSaveTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const confirmSavePrompt = async () => {
    if (!saveTitle.trim()) {
      setError("Please enter a title for the saved prompt.");
      return;
    }

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      title: saveTitle.trim(),
      prompt,
      images,
      outputs: outputs.length > 0 ? outputs : undefined,
      timestamp: Date.now(),
    };

    // Save to IndexedDB
    try {
      await indexedDBStorage.savePrompt(newPrompt);
      const updatedPrompts = [...savedPrompts, newPrompt];
      setSavedPrompts(updatedPrompts);
    } catch (error) {
      console.error("Failed to save prompt to IndexedDB:", error);
      setError("Failed to save prompt. Please try again.");
      return;
    }

    setModalClosing(true);
    setTimeout(() => {
      setShowSaveModal(false);
      setModalClosing(false);
      setSaveTitle("");
      setError("");
    }, 200);
  };

  const loadSavedPrompt = (savedPrompt: SavedPrompt) => {
    setPrompt(savedPrompt.prompt);
    setImages(savedPrompt.images);
    if (savedPrompt.outputs) {
      setOutputs(savedPrompt.outputs);
    }
  };

  const deleteSavedPrompt = async (id: string) => {
    try {
      await indexedDBStorage.deletePrompt(id);
      const updatedPrompts = savedPrompts.filter((p) => p.id !== id);
      setSavedPrompts(updatedPrompts);
    } catch (error) {
      console.error("Failed to delete prompt from IndexedDB:", error);
      setError("Failed to delete prompt. Please try again.");
    }
  };

  const downloadSavedPrompt = (savedPrompt: SavedPrompt) => {
    const blob = new Blob([JSON.stringify(savedPrompt, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${savedPrompt.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavedPromptsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Check if it's a single saved prompt or an array
          if (Array.isArray(data)) {
            // It's an array of saved prompts
            const newPrompts = data.filter(
              (item) => item.id && item.title && item.prompt && item.timestamp
            );
            if (newPrompts.length > 0) {
              try {
                // Save each prompt to IndexedDB
                for (const prompt of newPrompts) {
                  await indexedDBStorage.savePrompt(prompt);
                }
                const updatedPrompts = [...savedPrompts, ...newPrompts];
                setSavedPrompts(updatedPrompts);
              } catch (error) {
                console.error("Failed to save uploaded prompts:", error);
                setError("Failed to save some uploaded prompts.");
              }
            }
          } else if (data.id && data.title && data.prompt && data.timestamp) {
            // It's a single saved prompt
            try {
              await indexedDBStorage.savePrompt(data);
              const updatedPrompts = [...savedPrompts, data];
              setSavedPrompts(updatedPrompts);
            } catch (error) {
              console.error("Failed to save uploaded prompt:", error);
              setError("Failed to save uploaded prompt.");
            }
          } else {
            setError("Invalid saved prompt file format.");
          }
        } catch (error: unknown) {
          console.log(error);
          setError("Failed to load saved prompts file.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please select a valid JSON file.");
    }
    e.target.value = "";
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-950 transition-colors duration-300"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-25">
          <h1 className="text-3xl font-bold text-white">🍌 Image Generator</h1>
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
                  Stop generation
                </button>
              </div>
            ) : (
              <button
                onClick={generate}
                disabled={loading || (!prompt.trim() && images.length === 0)}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            )}

            {error && (
              <div className="bg-red-950/30 backdrop-blur-sm border border-red-800/50 rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-red-400 mb-1">
                      Something went wrong
                    </h4>
                    <p className="text-sm text-red-300/90 leading-relaxed">
                      {error}
                    </p>
                    {errorDetails?.suggestion && (
                      <p className="text-xs text-red-300/70 mt-2 italic">
                        💡 {errorDetails.suggestion}
                      </p>
                    )}
                    {errorDetails?.retryable && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={generate}
                          disabled={loading}
                          className="text-xs bg-red-800/50 hover:bg-red-700/50 text-red-200 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                          <svg
                            className="w-3 h-3 inline mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setError("");
                      setErrorDetails(null);
                    }}
                    className="flex-shrink-0 text-red-400/60 hover:text-red-400 transition-colors duration-200 p-1"
                    title="Dismiss error"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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

        {/* Saved Prompts Section */}
        <div className="space-y-4 mt-20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              Saved prompts
            </h3>
            <div className="flex gap-2">
              <button
                onClick={saveCurrentPrompt}
                disabled={!prompt.trim()}
                className="bg-blue-800 hover:bg-blue-700 disabled:bg-gray-900 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm"
                title="Save current prompt"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save
              </button>
              <label
                className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm"
                title="Upload saved prompts"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload
                <input
                  type="file"
                  accept=".json"
                  onChange={handleSavedPromptsUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {savedPrompts.length === 0 ? (
            <div className="bg-gray-950/30 hover:bg-gray-950/50 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl p-12 text-center cursor-pointer transition-all duration-300 group">
              <div className="space-y-3">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-white font-medium">No saved prompts yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Save your favorite prompts to reuse them later
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedPrompts
                .slice()
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((savedPrompt) => (
                  <div
                    key={savedPrompt.id}
                    className="bg-gray-950/60 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-lg truncate">
                          {savedPrompt.title}
                        </h4>
                        <p className="text-gray-300 mt-2 leading-relaxed">
                          {savedPrompt.prompt}
                        </p>
                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                          <span className="flex items-center gap-2">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {new Date(
                              savedPrompt.timestamp
                            ).toLocaleDateString()}
                          </span>
                          {savedPrompt.images.length > 0 && (
                            <span className="flex items-center gap-2">
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
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {savedPrompt.images.length} input
                              {savedPrompt.images.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {savedPrompt.outputs &&
                            savedPrompt.outputs.length > 0 && (
                              <span className="flex items-center gap-2">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {savedPrompt.outputs.length} output
                                {savedPrompt.outputs.length !== 1 ? "s" : ""}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => loadSavedPrompt(savedPrompt)}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200"
                          title="Load this prompt"
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
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => downloadSavedPrompt(savedPrompt)}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200"
                          title="Download as JSON"
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
                        </button>
                        <button
                          onClick={() => deleteSavedPrompt(savedPrompt.id)}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200"
                          title="Delete saved prompt"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 ${
              modalClosing ? "animate-fade-out" : "animate-fade-in"
            }`}
          >
            <div
              className={`bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl p-6 w-full max-w-md ${
                modalClosing ? "animate-scale-out" : "animate-scale-in"
              }`}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Save prompt
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    className="w-full p-3 bg-gray-950/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter a title for this prompt"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModalClosing(true);
                      setTimeout(() => {
                        setShowSaveModal(false);
                        setModalClosing(false);
                        setSaveTitle("");
                      }, 200);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSavePrompt}
                    disabled={!saveTitle.trim()}
                    className="flex-1 bg-blue-800 hover:bg-blue-700 disabled:bg-gray-900 disabled:opacity-50 text-white py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewerImage && (
          <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
