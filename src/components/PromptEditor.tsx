interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        Prompt
      </h3>

      <div className="relative flex">
        <div className="w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 p-1 rounded-2xl">
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
    </div>
  );
}
