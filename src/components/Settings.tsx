export default function Settings() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Configuration
      </h3>

      <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
          <div>
            <p className="text-emerald-800 dark:text-emerald-300 font-medium">
              Server Configuration Active
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">
              API key and model settings are securely configured on the server
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="font-medium text-slate-700 dark:text-slate-300">Model</div>
            <div className="text-slate-500 dark:text-slate-400 mt-1">Gemini 2.5 Flash Image</div>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="font-medium text-slate-700 dark:text-slate-300">Status</div>
            <div className="text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
