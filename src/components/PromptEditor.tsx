interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  const examplePrompts: string[] = [];

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        Describe Your Vision
      </h3>

      <div className="relative flex">
        <div className="w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 p-2 rounded-2xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 rounded-xl resize-none transition-all duration-300 focus:outline-none bg-gray-950 text-white placeholder-gray-400"
            rows={4}
            placeholder="Describe the image you want to create in detail..."
          />
        </div>

        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {prompt.length} characters
        </div>
      </div>

      {!prompt && examplePrompts.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600 mb-2">
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {(prompt || examplePrompts.length <= 0) && (
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>Tip: Be specific and descriptive for better results</span>
          </div>
          <button
            onClick={() => setPrompt("")}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
