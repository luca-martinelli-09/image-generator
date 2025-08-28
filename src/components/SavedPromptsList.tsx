import type { SavedPrompt, UploadedImage, OutputFile } from "../types";
import { downloadSavedPrompt } from "../utils/fileUtils";

interface Props {
  savedPrompts: SavedPrompt[];
  onLoad: (prompt: string, images: UploadedImage[], outputs?: OutputFile[]) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onUpload: (file: File) => void;
  canSave: boolean;
}

export default function SavedPromptsList({ 
  savedPrompts, 
  onLoad, 
  onDelete, 
  onSave, 
  onUpload,
  canSave
}: Props) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = "";
  };

  const loadSavedPrompt = (savedPrompt: SavedPrompt) => {
    onLoad(savedPrompt.prompt, savedPrompt.images, savedPrompt.outputs);
  };

  return (
    <div className="space-y-4 mt-20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Saved prompts
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={!canSave}
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
              onChange={handleFileUpload}
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
                        {new Date(savedPrompt.timestamp).toLocaleDateString()}
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
                      {savedPrompt.outputs && savedPrompt.outputs.length > 0 && (
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
                      onClick={() => onDelete(savedPrompt.id)}
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
  );
}