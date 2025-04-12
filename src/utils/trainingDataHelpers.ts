/**
 * Training Data Helper Functions
 * 
 * Utilities for handling the conversion of training data to files and formats that can be
 * processed by the backend API.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert prompt text strings to text files
 * @param prompts Array of prompt strings
 * @param categories Optional map of categorized prompts
 * @param promptMetadata Optional metadata for specific prompts
 * @returns Array of File objects representing the prompts
 */
export const convertPromptsToFiles = (
  prompts: string[] = [], 
  categories?: Record<string, string[]>,
  promptMetadata?: Record<string, any>
): File[] => {
  const files: File[] = [];
  
  // Process regular prompts
  prompts.forEach((prompt, index) => {
    const promptBlob = new Blob([prompt], { type: 'text/plain' });
    const fileName = `prompt-${index + 1}-${Date.now()}.txt`;
    const file = new File([promptBlob], fileName, { type: 'text/plain' });
    
    // Add custom properties for metadata handling
    Object.defineProperty(file, 'promptData', {
      value: {
        isPrompt: true,
        content: prompt,
        metadata: promptMetadata?.[prompt] || undefined,
        category: 'general'
      },
      writable: false
    });
    
    files.push(file);
  });
  
  // Process categorized prompts if present
  if (categories) {
    Object.entries(categories).forEach(([category, categoryPrompts], categoryIndex) => {
      categoryPrompts.forEach((prompt, promptIndex) => {
        const promptBlob = new Blob([prompt], { type: 'text/plain' });
        const fileName = `prompt-category-${category}-${promptIndex + 1}-${Date.now()}.txt`;
        const file = new File([promptBlob], fileName, { 
          type: 'text/plain'
        });
        
        // Add custom properties for metadata handling
        Object.defineProperty(file, 'promptData', {
          value: {
            isPrompt: true,
            content: prompt,
            metadata: promptMetadata?.[prompt] || undefined,
            category
          },
          writable: false
        });
        
        files.push(file);
      });
    });
  }
  
  return files;
};

/**
 * Extract metadata from training files
 * @param files Array of training files
 * @param imageMetadata Optional metadata for specific images
 * @param videoMetadata Optional metadata for specific videos
 * @returns Object with metadata indexed by file ID
 */
export const extractTrainingMetadata = (
  files: File[],
  imageMetadata?: Record<string, any>,
  videoMetadata?: Record<string, any>,
  fileMetadata?: Record<string, any>
): Record<string, any> => {
  const metadata: Record<string, any> = {};
  
  files.forEach(file => {
    const fileId = uuidv4();
    let fileSpecificMetadata: any = { fileId };
    
    // Check if this is a prompt file with custom properties
    if (file.promptData && file.promptData.isPrompt) {
      fileSpecificMetadata = {
        ...fileSpecificMetadata,
        type: 'prompt',
        content: file.promptData.content,
        category: file.promptData.category,
        ...file.promptData.metadata
      };
    } 
    // Handle image files
    else if (file.type.startsWith('image/') && imageMetadata?.[file.name]) {
      fileSpecificMetadata = {
        ...fileSpecificMetadata,
        type: 'image',
        ...imageMetadata[file.name]
      };
    } 
    // Handle other files with metadata
    else if (fileMetadata?.[file.name]) {
      fileSpecificMetadata = {
        ...fileSpecificMetadata,
        ...fileMetadata[file.name]
      };
    }
    
    metadata[file.name] = fileSpecificMetadata;
  });
  
  return metadata;
};

/**
 * Process video URLs for submission
 * @param videoUrls Array of video URLs
 * @param videoMetadata Optional metadata for specific videos
 * @returns Processed video data with metadata
 */
export const processVideoReferences = (
  videoUrls: string[] = [],
  videoMetadata?: Record<string, any>
): Record<string, any> => {
  const processedVideos: Record<string, any> = {};
  
  videoUrls.forEach((url, index) => {
    const videoId = uuidv4();
    
    processedVideos[videoId] = {
      url,
      order: index,
      ...(videoMetadata?.[url] || {})
    };
  });
  
  return processedVideos;
};

/**
 * Prepare training data for API submission
 * @param trainingData The training data object from the form
 * @returns Processed training data ready for API submission
 */
export const prepareTrainingDataForSubmission = (trainingData: any): Record<string, any> => {
  if (!trainingData) return {};
  
  // Convert prompts to files
  const promptFiles = convertPromptsToFiles(
    trainingData.prompts || [],
    trainingData.promptCategories
  );
  
  // Extract metadata for images
  const fileMetadata = extractTrainingMetadata(
    [
      ...(trainingData.referenceImages || []), 
      ...promptFiles,
      ...(trainingData.otherFiles || [])
    ],
    trainingData.referenceImageMetadata,
    undefined,
    trainingData.otherFileMetadata
  );
  
  // Process video references
  const videoReferences = processVideoReferences(
    trainingData.referenceVideoUrls || [],
    trainingData.referenceVideoMetadata
  );
  
  return {
    files: [
      ...(trainingData.referenceImages || []),
      ...promptFiles,
      ...(trainingData.otherFiles || [])
    ],
    fileMetadata,
    videoReferences,
    methodology: trainingData.trainingMethodology,
    datasetInfo: trainingData.trainingDatasetInfo,
    architecture: trainingData.modelArchitecture,
    hyperparameters: trainingData.hyperparameterInfo,
    evaluationMetrics: trainingData.evaluationMetrics,
    isTrainable: trainingData.isTrainable
  };
};