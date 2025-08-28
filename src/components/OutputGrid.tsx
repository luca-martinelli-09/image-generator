import type { OutputFile } from "../types";

interface Props {
  outputs: OutputFile[];
  onImageClick: (src: string) => void;
}

export default function OutputGrid({ outputs, onImageClick }: Props) {
  if (outputs.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-6">
      {outputs.map((out) => (
        <div
          key={out.filename}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group"
        >
          <div
            className="relative overflow-hidden rounded-xl cursor-pointer"
            onClick={() =>
              onImageClick(`data:${out.mimeType};base64,${out.base64}`)
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
                onImageClick(`data:${out.mimeType};base64,${out.base64}`)
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
  );
}