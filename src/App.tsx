import { useState } from "react";
import ImageUploader, { type UploadedImage } from "./components/ImageUploader";
import Settings from "./components/Settings";
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
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Image Generator</h1>

      <Settings />
      <PromptEditor prompt={prompt} setPrompt={setPrompt} />
      <ImageUploader images={images} setImages={setImages} />

      <button
        onClick={generate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow mt-4"
      >
        {loading ? "Generating..." : "Create"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        {outputs.map((out) => (
          <div key={out.filename} className="border rounded p-2">
            <img
              src={`data:${out.mimeType};base64,${out.base64}`}
              className="w-full rounded"
            />
            <a
              href={`data:${out.mimeType};base64,${out.base64}`}
              download={out.filename}
              className="block text-center mt-2 bg-green-600 text-white py-1 rounded"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
