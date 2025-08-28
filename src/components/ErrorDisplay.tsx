import type { ErrorData } from "../types";

interface Props {
  error: string;
  errorDetails: ErrorData | null;
  onRetry: () => void;
  onDismiss: () => void;
  loading: boolean;
}

export default function ErrorDisplay({ error, errorDetails, onRetry, onDismiss, loading }: Props) {
  return (
    <div className="bg-red-950/30 backdrop-blur-sm border border-red-800/50 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-400 mb-1">
            Something went wrong
          </h4>
          <p className="text-sm text-red-300/90 leading-relaxed">
            {error}
          </p>
          {errorDetails?.suggestion && (
            <p className="text-xs text-red-300/70 mt-2 italic">
              {errorDetails.suggestion}
            </p>
          )}
          {errorDetails?.retryable && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onRetry}
                disabled={loading}
                className="text-xs bg-red-800/50 hover:bg-red-700/50 text-red-200 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <svg
                  className="w-3 h-3 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-400/60 hover:text-red-400 transition-colors duration-200 p-1"
          title="Dismiss error"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}