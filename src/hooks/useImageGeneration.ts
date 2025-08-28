import { useState } from "react";
import type { UploadedImage, OutputFile, ErrorData, EnhancedError } from "../types";

export function useImageGeneration() {
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<ErrorData | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const generate = async (prompt: string, images: UploadedImage[]) => {
    setLoading(true);
    setError("");

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, images }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const error: EnhancedError = new Error(
          errorData.error || `Server error: ${res.status}`
        );
        error.errorData = errorData;
        throw error;
      }

      const data = await res.json();

      if (data.error) {
        const error: EnhancedError = new Error(data.error);
        error.errorData = data;
        throw error;
      }

      setOutputs(data.outputs || []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Generation cancelled");
        setErrorDetails(null);
      } else if (err instanceof Error) {
        const enhancedError = err as EnhancedError;
        if (enhancedError.errorData) {
          setError(err.message);
          setErrorDetails({
            code: enhancedError.errorData.code,
            suggestion: enhancedError.errorData.suggestion,
            retryable: enhancedError.errorData.retryable,
          });
        } else {
          if (
            err.message.includes("fetch") ||
            err.message.includes("network")
          ) {
            setError("Network error. Please check your connection.");
            setErrorDetails({
              suggestion: "Verify your internet connection and try again.",
              retryable: true,
            });
          } else {
            setError(err.message);
            setErrorDetails(null);
          }
        }
      } else {
        setError("Unknown error occurred");
        setErrorDetails(null);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const clearError = () => {
    setError("");
    setErrorDetails(null);
  };

  return {
    outputs,
    setOutputs,
    loading,
    error,
    errorDetails,
    generate,
    cancelGeneration,
    clearError,
  };
}