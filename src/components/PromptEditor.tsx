import { useState } from "react";

interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  const [focused, setFocused] = useState(false);

  const examplePrompts: string[] = [];

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Describe Your Vision
      </h3>

      <div className="relative">
        <div className={`relative rounded-xl transition-all duration-300 ${
          focused ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5' : ''
        }`}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full p-4 rounded-xl resize-none transition-all duration-300 focus:outline-none ${
              focused
                ? "bg-white dark:bg-slate-900 shadow-lg border-0"
                : "border-2 border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
            } text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400`}
            rows={4}
            placeholder="Describe the image you want to create in detail..."
          />
        </div>

        <div
          className={`absolute bottom-3 right-3 text-xs transition-all duration-300 ${
            focused ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
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
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <span>💡</span>
            <span>Tip: Be specific and descriptive for better results</span>
          </div>
          <button
            onClick={() => setPrompt("")}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
