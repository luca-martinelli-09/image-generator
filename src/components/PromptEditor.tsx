import { useEffect, useRef, useState } from "react";

interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  }, [prompt]);

  const enhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setPrompt(data.enhancedPrompt);
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Prompt
        </h3>
        <button
          onClick={enhancePrompt}
          disabled={!prompt.trim() || isEnhancing}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnhancing ? (
            <div className="size-8 border-4 border-gray-400 border-t-blue-500 border-r-yellow-500 border-b-red-500 border-l-green-500 rounded-full animate-spin"></div>
          ) : (
            <svg className="size-8" fill="url(#conicGradient)" viewBox="0 0 24 24">
              <defs>
                <defs>
                  <linearGradient id="conicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="25%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="75%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </defs>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full p-1 rounded-2xl" style={{
        background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6 0%, #EF4444 25%, #EAB308 50%, #10B981 75%, #3B82F6 100%)'
      }}>
        <div className="relative bg-gray-950 rounded-xl">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isEnhancing}
            className="w-full p-4 pb-8 rounded-xl resize-none transition-all duration-300 focus:outline-none bg-transparent text-white placeholder-gray-400 overflow-hidden disabled:opacity-50"
            placeholder="Describe the image you want to create in detail..."
            style={{ minHeight: "100px" }}
          />
          <div className="absolute bottom-2 right-4 text-xs text-gray-400 pointer-events-none">
            {prompt.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
