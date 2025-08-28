import { useDropzone } from "react-dropzone";
import { Reorder } from "framer-motion";
import { type Dispatch, type SetStateAction, useEffect } from "react";

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
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file, index) => {
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
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="p-4 border rounded-lg">
      <div
        {...getRootProps()}
        className="p-6 border-2 border-dashed text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag & drop images, paste, or click to upload</p>
      </div>

      <Reorder.Group
        axis="x"
        values={images}
        onReorder={setImages}
        className="flex gap-2 mt-4 overflow-x-auto"
        as="div"
      >
        {images.map((img) => (
          <Reorder.Item 
            key={img.id} 
            value={img} 
            className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
            drag
            whileDrag={{ scale: 1.05, zIndex: 1000 }}
          >
            <img
              src={`data:${img.mimeType};base64,${img.base64}`}
              className="h-32 w-32 object-cover rounded shadow pointer-events-none"
              draggable={false}
            />
            <button
              onClick={() =>
                setImages((prev) => prev.filter((i) => i.id !== img.id))
              }
              className="absolute top-1 right-1 bg-red-600 text-white rounded px-1 pointer-events-auto"
            >
              ✕
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
