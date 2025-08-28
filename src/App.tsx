import { useEffect, useState } from "react";
import {
  ImageUploader,
  ImageViewer,
  PromptEditor,
  ErrorDisplay,
  GenerateButton,
  OutputGrid,
  SaveModal,
  SavedPromptsList,
} from "./components";
import { useImageGeneration, useSavedPrompts, useProject } from "./hooks";
import { handleDragOver, handleFileDrop as utilHandleFileDrop } from "./utils";
import type { UploadedImage, OutputFile } from "./types";

function App() {
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  
  // Custom hooks for state management
  const { images, setImages, prompt, setPrompt, loadProject } = useProject();
  const {
    outputs,
    setOutputs,
    loading,
    error,
    errorDetails,
    generate,
    cancelGeneration,
    clearError,
  } = useImageGeneration();
  const {
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
  } = useSavedPrompts();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleGenerate = () => {
    generate(prompt, images);
  };

  const handleProjectLoad = async (file: File) => {
    const result = await loadProject(file);
    if (!result.success && result.error) {
      // Handle error - you might want to show this in the UI
      console.error(result.error);
    }
  };

  const handleSavePrompt = async () => {
    const result = await savePrompt(prompt, images, outputs);
    if (!result.success && result.error) {
      // Handle error - you might want to show this in the UI
      console.error(result.error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    const result = await deletePrompt(id);
    if (!result.success && result.error) {
      // Handle error - you might want to show this in the UI
      console.error(result.error);
    }
  };

  const handleUploadPrompts = async (file: File) => {
    const result = await uploadPrompts(file);
    if (!result.success && result.error) {
      // Handle error - you might want to show this in the UI
      console.error(result.error);
    }
  };

  const handleLoadSavedPrompt = (promptText: string, savedImages: UploadedImage[], savedOutputs?: OutputFile[]) => {
    setPrompt(promptText);
    setImages(savedImages);
    if (savedOutputs) {
      setOutputs(savedOutputs);
    } else {
      // Clear outputs if the saved prompt doesn't have any
      setOutputs([]);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    // Check if the drop is happening over the ImageUploader component
    const target = e.target as HTMLElement;
    const isOverImageUploader = target.closest('[data-component="image-uploader"]');
    
    // If dropping over image uploader, let it handle the drop
    if (isOverImageUploader) {
      return;
    }

    // Check if any of the files being dropped are images
    const files = Array.from(e.dataTransfer.files);
    const hasImages = files.some(file => file.type.startsWith('image/'));
    
    // If dropping images outside the image uploader, don't handle it
    if (hasImages) {
      return;
    }

    // Otherwise, handle as project file drop (JSON)
    utilHandleFileDrop(e, handleProjectLoad, (error) => {
      // Handle error - you might want to show this in the UI
      console.error(error);
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-950 transition-colors duration-300"
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-25">
          <h1 className="text-3xl font-bold text-white">🍌 Image Generator</h1>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            <ImageUploader
              images={images}
              setImages={setImages}
              onImageClick={setViewerImage}
            />
            <PromptEditor prompt={prompt} setPrompt={setPrompt} />

            <GenerateButton
              loading={loading}
              disabled={!prompt.trim() && images.length === 0}
              onGenerate={handleGenerate}
              onCancel={cancelGeneration}
            />

            {error && (
              <ErrorDisplay
                error={error}
                errorDetails={errorDetails}
                onRetry={handleGenerate}
                onDismiss={clearError}
                loading={loading}
              />
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Generated Images
            </h3>
            <OutputGrid outputs={outputs} onImageClick={setViewerImage} />
          </div>
        </div>

        {/* Saved Prompts Section */}
        <SavedPromptsList
          savedPrompts={savedPrompts}
          onLoad={handleLoadSavedPrompt}
          onDelete={handleDeletePrompt}
          onSave={() => startSaving(prompt)}
          onUpload={handleUploadPrompts}
          canSave={prompt.trim().length > 0}
        />

        {/* Save Modal */}
        <SaveModal
          show={showSaveModal}
          closing={modalClosing}
          title={saveTitle}
          onTitleChange={setSaveTitle}
          onSave={handleSavePrompt}
          onCancel={cancelSaving}
        />

        {viewerImage && (
          <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
        )}
      </div>
    </div>
  );
}

export default App;