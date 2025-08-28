interface Props {
  show: boolean;
  closing: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function SaveModal({ 
  show, 
  closing, 
  title, 
  onTitleChange, 
  onSave, 
  onCancel 
}: Props) {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        className={`bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl p-6 w-full max-w-md ${
          closing ? "animate-scale-out" : "animate-scale-in"
        }`}
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Save prompt
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full p-3 bg-gray-950/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all duration-200"
              placeholder="Enter a title for this prompt"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!title.trim()}
              className="flex-1 bg-blue-800 hover:bg-blue-700 disabled:bg-gray-900 disabled:opacity-50 text-white py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}