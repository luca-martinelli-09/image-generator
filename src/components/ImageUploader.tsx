import { useDropzone } from "react-dropzone";
import { Reorder } from "framer-motion";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useCallback,
} from "react";

export interface UploadedImage {
  id: number;
  base64: string;
  mimeType: string;
}

interface Props {
  images: UploadedImage[];
  setImages: Dispatch<SetStateAction<UploadedImage[]>>;
}

export default function ImageUploader({ images, setImages }: Props) {
  const processFiles = useCallback(
    (files: File[]) => {
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: Date.now() + index,
              base64: (reader.result as string).split(",")[1],
              mimeType: file.type,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [setImages]
  );

  const onDrop = (acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        📸 Source Images
      </h3>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50/80 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group"
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
            📁
          </div>
          <div>
            <p className="text-slate-700 font-medium">
              Drag & drop images here
            </p>
            <p className="text-slate-500 text-sm mt-1">
              or click to browse • Paste with Ctrl+V
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Supports: JPG, PNG, GIF, WebP
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </span>
            <span className="text-xs text-slate-400">Drag to reorder</span>
          </div>

          <Reorder.Group
            axis="x"
            values={images}
            onReorder={setImages}
            className="flex gap-3 overflow-x-auto pb-2 list-none"
            as="ul"
          >
            {images.map((img) => (
              <Reorder.Item
                key={img.id}
                value={img}
                className="relative flex-shrink-0 cursor-grab active:cursor-grabbing group list-none p-2"
                drag
                whileDrag={{ scale: 1.05, zIndex: 1000, rotate: 3 }}
                whileHover={{ scale: 1.02 }}
                as="li"
              >
                <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    className="h-24 w-24 object-cover pointer-events-none"
                    draggable={false}
                    alt="Uploaded image"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                </div>

                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((i) => i.id !== img.id))
                  }
                  className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs pointer-events-auto transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  ×
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
