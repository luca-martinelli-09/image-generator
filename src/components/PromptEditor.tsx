interface Props {
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PromptEditor({ prompt, setPrompt }: Props) {
  return (
    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      className="w-full p-3 border rounded mt-4"
      rows={3}
      placeholder="Enter your prompt..."
    />
  );
}
