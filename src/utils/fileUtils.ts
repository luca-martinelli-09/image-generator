import type { SavedPrompt } from "../types";

export function downloadSavedPrompt(savedPrompt: SavedPrompt) {
  const blob = new Blob([JSON.stringify(savedPrompt, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${savedPrompt.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function handleDragOver(e: React.DragEvent) {
  // Check if dragging over image uploader
  const target = e.target as HTMLElement;
  const isOverImageUploader = target.closest('[data-component="image-uploader"]');
  
  if (isOverImageUploader) {
    return; // Let react-dropzone handle it
  }

  e.preventDefault();
  e.stopPropagation();
}

export function handleFileDrop(
  e: React.DragEvent,
  onFileLoad: (file: File) => void,
  onError: (error: string) => void
) {
  e.preventDefault();
  e.stopPropagation();

  const files = Array.from(e.dataTransfer.files);
  const jsonFile = files.find((file) => file.type === "application/json");

  if (jsonFile) {
    onFileLoad(jsonFile);
  } else {
    onError("Please drop a valid JSON project file.");
  }
}