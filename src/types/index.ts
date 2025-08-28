export interface UploadedImage {
  id: number;
  base64: string;
  mimeType: string;
}

export interface OutputFile {
  mimeType: string;
  base64: string;
  filename: string;
}

export interface ProjectData {
  prompt: string;
  images: UploadedImage[];
  timestamp: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  images: UploadedImage[];
  outputs?: OutputFile[];
  timestamp: number;
}

export interface ErrorData {
  code?: string;
  suggestion?: string;
  retryable?: boolean;
}

export interface EnhancedError extends Error {
  errorData?: ErrorData;
}