import { useEffect } from "react";

interface Props {
  src: string;
  onClose: () => void;
}

export default function ImageViewer({ src, onClose }: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 overflow-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="relative my-8">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
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

          <img
            src={src}
            alt="Full screen view"
            className="max-w-full h-auto rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
          />
        </div>
      </div>
    </div>
  );
}
