import { useRef, useEffect } from "react";

interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  }, [prompt]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        Prompt
      </h3>

      <div className="w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 p-1 rounded-2xl">
        <div className="relative bg-gray-950 rounded-xl">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 pb-8 rounded-xl resize-none transition-all duration-300 focus:outline-none bg-transparent text-white placeholder-gray-400 overflow-hidden"
            placeholder="Describe the image you want to create in detail..."
            style={{ minHeight: '100px' }}
          />
          <div className="absolute bottom-2 right-4 text-xs text-gray-400 pointer-events-none">
            {prompt.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
