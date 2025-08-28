import { Reorder } from "framer-motion";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
} from "react";
import { useDropzone } from "react-dropzone";

export interface UploadedImage {
  id: number;
  base64: string;
  mimeType: string;
}

interface Props {
  images: UploadedImage[];
  setImages: Dispatch<SetStateAction<UploadedImage[]>>;
  onImageClick?: (src: string) => void;
}

export default function ImageUploader({
  images,
  setImages,
  onImageClick,
}: Props) {
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        Images
      </h3>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-600 hover:border-gray-500 bg-gray-950/30 hover:bg-gray-950/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group"
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <div>
            <p className="text-white font-medium">Drag & drop images here</p>
            <p className="text-gray-400 text-sm mt-1">
              or click to browse • Paste with Ctrl+V
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WebP
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </span>
            <span className="text-xs text-gray-500">Drag to reorder</span>
          </div>

          <Reorder.Group
            axis="x"
            values={images}
            onReorder={setImages}
            className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-2 list-none"
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
                <div
                  className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    onImageClick?.(`data:${img.mimeType};base64,${img.base64}`)
                  }
                >
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
                  className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center pointer-events-auto shadow-lg border border-gray-600  transition-all duration-200 hover:scale-110"
                >
                  <svg
                    className="w-3 h-3"
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
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
