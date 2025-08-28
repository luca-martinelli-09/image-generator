export interface UploadedImage {
  id: number;
  base64: string;
  mimeType: string;
}

export interface GenerateRequest {
  apiKey?: string;
  model?: string;
  prompt: string;
  images: UploadedImage[];
}

export interface OutputFile {
  mimeType: string;
  base64: string;
  filename: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  suggestion?: string;
  retryable?: boolean;
}

export interface EnhancePromptRequest {
  prompt: string;
}

export interface EnhancePromptResponse {
  enhancedPrompt: string;
}

export interface GenerateResponse {
  outputs: OutputFile[];
}
