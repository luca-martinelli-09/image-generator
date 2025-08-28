import { useState } from "react";

interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  const [focused, setFocused] = useState(false);

  const examplePrompts: string[] = [];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        ✍️ Describe Your Vision
      </h3>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full p-4 border-2 rounded-xl resize-none transition-all duration-300 focus:outline-none ${
            focused
              ? "border-indigo-400 bg-white shadow-lg"
              : "border-slate-300 bg-slate-50/50"
          }`}
          rows={4}
          placeholder="Describe the image you want to create in detail..."
        />

        <div
          className={`absolute bottom-3 right-3 text-xs transition-all duration-300 ${
            focused ? "text-indigo-500" : "text-slate-400"
          }`}
        >
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
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>💡</span>
            <span>Tip: Be specific and descriptive for better results</span>
          </div>
          <button
            onClick={() => setPrompt("")}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
