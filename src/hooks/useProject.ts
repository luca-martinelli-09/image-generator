import { useState, useEffect, useCallback, useRef } from "react";
import type { UploadedImage, ProjectData } from "../types";
import { storageManager } from "../utils/storageManager";

export function useProject() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved project on mount
  useEffect(() => {
    const saved = storageManager.getItem("image-generator-project");
    if (saved) {
      try {
        const projectData: ProjectData = JSON.parse(saved);
        setPrompt(projectData.prompt || "");
        setImages(projectData.images || []);
      } catch (error) {
        console.error("Failed to load saved project:", error);
      }
    }
  }, []);

  // Auto-save with debouncing (save after 1 second of inactivity)
  useEffect(() => {
    // Clear the previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Always set up auto-save to handle both saving content and clearing empty state
    saveTimeoutRef.current = setTimeout(async () => {
      const projectData: ProjectData = {
        prompt,
        images,
        timestamp: Date.now(),
      };
      
      // If both prompt and images are empty, remove from storage
      if (!prompt.trim() && images.length === 0) {
        storageManager.removeItem("image-generator-project");
      } else {
        // Otherwise save the current state
        const result = await storageManager.setItem(
          "image-generator-project", 
          JSON.stringify(projectData)
        );
        
        if (!result.success && result.error) {
          console.error("Failed to save project:", result.error);
        }
      }
    }, 1000); // Wait 1 second after user stops typing

    // Cleanup function to clear timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [prompt, images]);

  const loadProject = useCallback((file: File): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData: ProjectData = JSON.parse(e.target?.result as string);
          setPrompt(projectData.prompt || "");
          setImages(projectData.images || []);
          resolve({ success: true });
        } catch (error: unknown) {
          console.log(error);
          resolve({ 
            success: false, 
            error: "Failed to load project file. Please check the file format." 
          });
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const downloadProject = useCallback(() => {
    const projectData: ProjectData = {
      prompt,
      images,
      timestamp: Date.now(),
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-generator-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [prompt, images]);

  return {
    images,
    setImages,
    prompt,
    setPrompt,
    loadProject,
    downloadProject,
  };
}