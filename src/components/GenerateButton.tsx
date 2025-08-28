interface Props {
  loading: boolean;
  disabled: boolean;
  onGenerate: () => void;
  onCancel: () => void;
}

export default function GenerateButton({ loading, disabled, onGenerate, onCancel }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <button
          onClick={onGenerate}
          disabled={true}
          className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating...</span>
          </div>
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-red-800 hover:bg-red-700 text-white font-medium py-2 px-8 rounded-xl transition-all duration-200"
        >
          Stop generation
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
    >
      Generate
    </button>
  );
}