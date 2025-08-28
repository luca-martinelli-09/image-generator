class StorageManager {
  private static instance: StorageManager;
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async setItem(key: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn(`localStorage quota exceeded for key "${key}". Attempting cleanup.`);
        
        // Try to clear old project data and retry
        try {
          if (key !== "image-generator-project") {
            localStorage.removeItem("image-generator-project");
          }
          
          // Try again after clearing
          localStorage.setItem(key, value);
          return { success: true };
        } catch (retryError) {
          console.error("Failed to save after cleanup:", retryError);
          
          // Last resort: try with sessionStorage
          try {
            sessionStorage.setItem(key, value);
            console.warn(`Fell back to sessionStorage for key "${key}"`);
            return { success: true };
          } catch (sessionError) {
            return { 
              success: false, 
              error: "Storage quota exceeded and all fallbacks failed" 
            };
          }
        }
      } else {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown storage error" 
        };
      }
    }
  }

  getItem(key: string): string | null {
    try {
      // Try localStorage first
      const value = localStorage.getItem(key);
      if (value !== null) {
        return value;
      }
      
      // Fallback to sessionStorage
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item "${key}":`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item "${key}":`, error);
    }
  }

  async getStorageInfo(): Promise<{ 
    localStorage: { used: number; available: number }; 
    sessionStorage: { used: number; available: number };
  }> {
    const getStorageSize = (storage: Storage) => {
      let total = 0;
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          total += storage[key].length + key.length;
        }
      }
      return total;
    };

    // Rough estimates (actual limits vary by browser)
    const localStorageLimit = 5 * 1024 * 1024; // ~5MB
    const sessionStorageLimit = 5 * 1024 * 1024; // ~5MB

    return {
      localStorage: {
        used: getStorageSize(localStorage),
        available: localStorageLimit
      },
      sessionStorage: {
        used: getStorageSize(sessionStorage),
        available: sessionStorageLimit
      }
    };
  }
}

export const storageManager = StorageManager.getInstance();