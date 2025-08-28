import { useState, useEffect } from "react";
import { indexedDBStorage } from "../utils/indexedDB";
import type { SavedPrompt, UploadedImage, OutputFile } from "../types";

export function useSavedPrompts() {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [modalClosing, setModalClosing] = useState(false);

  useEffect(() => {
    loadSavedPrompts();
  }, []);

  const loadSavedPrompts = async () => {
    try {
      const prompts = await indexedDBStorage.getAllPrompts();
      setSavedPrompts(prompts);
    } catch (error) {
      console.error("Failed to load saved prompts from IndexedDB:", error);
      // Fallback to localStorage if IndexedDB fails
      try {
        const savedPromptsData = localStorage.getItem("image-generator-saved-prompts");
        if (savedPromptsData) {
          const localPrompts = JSON.parse(savedPromptsData);
          setSavedPrompts(localPrompts);
          // Migrate to IndexedDB
          for (const prompt of localPrompts) {
            try {
              await indexedDBStorage.savePrompt(prompt);
            } catch (err) {
              console.error("Failed to migrate prompt to IndexedDB:", err);
            }
          }
          // Clear localStorage after migration
          localStorage.removeItem("image-generator-saved-prompts");
        }
      } catch (localStorageError) {
        console.error("Failed to load from localStorage fallback:", localStorageError);
      }
    }
  };

  const savePrompt = async (
    prompt: string,
    images: UploadedImage[],
    outputs?: OutputFile[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!saveTitle.trim()) {
      return { success: false, error: "Please enter a title for the saved prompt." };
    }

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      title: saveTitle.trim(),
      prompt,
      images,
      outputs: outputs && outputs.length > 0 ? outputs : undefined,
      timestamp: Date.now(),
    };

    try {
      await indexedDBStorage.savePrompt(newPrompt);
      const updatedPrompts = [...savedPrompts, newPrompt];
      setSavedPrompts(updatedPrompts);
      
      setModalClosing(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setModalClosing(false);
        setSaveTitle("");
      }, 200);
      
      return { success: true };
    } catch (error) {
      console.error("Failed to save prompt to IndexedDB:", error);
      return { success: false, error: "Failed to save prompt. Please try again." };
    }
  };

  const deletePrompt = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await indexedDBStorage.deletePrompt(id);
      const updatedPrompts = savedPrompts.filter((p) => p.id !== id);
      setSavedPrompts(updatedPrompts);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete prompt from IndexedDB:", error);
      return { success: false, error: "Failed to delete prompt. Please try again." };
    }
  };

  const uploadPrompts = async (file: File): Promise<{ success: boolean; error?: string }> => {
    if (!file || file.type !== "application/json") {
      return { success: false, error: "Please select a valid JSON file." };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (Array.isArray(data)) {
            const newPrompts = data.filter(
              (item) => item.id && item.title && item.prompt && item.timestamp
            );
            if (newPrompts.length > 0) {
              try {
                for (const prompt of newPrompts) {
                  await indexedDBStorage.savePrompt(prompt);
                }
                const updatedPrompts = [...savedPrompts, ...newPrompts];
                setSavedPrompts(updatedPrompts);
                resolve({ success: true });
              } catch (error) {
                console.error("Failed to save uploaded prompts:", error);
                resolve({ success: false, error: "Failed to save some uploaded prompts." });
              }
            } else {
              resolve({ success: false, error: "No valid prompts found in the file." });
            }
          } else if (data.id && data.title && data.prompt && data.timestamp) {
            try {
              await indexedDBStorage.savePrompt(data);
              const updatedPrompts = [...savedPrompts, data];
              setSavedPrompts(updatedPrompts);
              resolve({ success: true });
            } catch (error) {
              console.error("Failed to save uploaded prompt:", error);
              resolve({ success: false, error: "Failed to save uploaded prompt." });
            }
          } else {
            resolve({ success: false, error: "Invalid saved prompt file format." });
          }
        } catch (error: unknown) {
          console.log(error);
          resolve({ success: false, error: "Failed to load saved prompts file." });
        }
      };
      reader.readAsText(file);
    });
  };

  const startSaving = (prompt: string) => {
    const defaultTitle = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
    setSaveTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const cancelSaving = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowSaveModal(false);
      setModalClosing(false);
      setSaveTitle("");
    }, 200);
  };

  return {
    savedPrompts,
    showSaveModal,
    saveTitle,
    setSaveTitle,
    modalClosing,
    savePrompt,
    deletePrompt,
    uploadPrompts,
    startSaving,
    cancelSaving,
  };
}