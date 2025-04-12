/**
 * Training Data Service
 * 
 * Handles operations related to training data, including processing and API interactions
 */

import api from '../services/api/api';
import { ApiResponse } from '../types/api.types';
import { v4 as uuidv4 } from 'uuid';
import { prepareTrainingDataForSubmission } from '../utils/trainingDataHelpers';

class TrainingDataService {
  private useMockData: boolean = true;
  
  /**
   * Submit training data for an asset
   * @param assetId The ID of the asset
   * @param trainingData The training data object from the form
   * @returns The processed and submitted training data
   */
  async submitTrainingData(assetId: string, trainingData: any): Promise<any> {
    try {
      // Process the training data
      const processedData = prepareTrainingDataForSubmission(trainingData);
      
      // If using mock data, return a simulated response
      if (this.useMockData) {
        console.log('Using mock data for training data submission', processedData);
        
        return {
          id: assetId,
          trainingData: {
            id: uuidv4(),
            assetId,
            isTrainable: trainingData.isTrainable,
            methodology: trainingData.trainingMethodology,
            datasetInfo: trainingData.trainingDatasetInfo,
            promptCount: (trainingData.prompts || []).length,
            imageCount: (trainingData.referenceImages || []).length,
            videoCount: (trainingData.referenceVideoUrls || []).length,
            otherFileCount: (trainingData.otherFiles || []).length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }
      
      // In a real implementation, submit to the API
      const response = await api.post<ApiResponse<any>>(
        `/assets/${assetId}/training-data`,
        processedData
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error submitting training data:', error);
      throw new Error('Failed to submit training data');
    }
  }
  
  /**
   * Get training data for an asset
   * @param assetId The ID of the asset
   * @returns The training data for the asset
   */
  async getTrainingData(assetId: string): Promise<any> {
    try {
      // If using mock data, return a simulated response
      if (this.useMockData) {
        console.log('Using mock data for training data retrieval', assetId);
        
        return {
          id: uuidv4(),
          assetId,
          isTrainable: true,
          methodology: 'Example methodology for asset ' + assetId,
          datasetInfo: 'Example dataset information',
          prompts: [
            { id: uuidv4(), text: 'Example prompt 1', category: 'general' },
            { id: uuidv4(), text: 'Example prompt 2', category: 'general' }
          ],
          categories: [
            { 
              id: uuidv4(), 
              name: 'Style Variations', 
              prompts: [
                { id: uuidv4(), text: 'Style variation prompt 1' },
                { id: uuidv4(), text: 'Style variation prompt 2' }
              ]
            }
          ],
          images: [
            { 
              id: uuidv4(), 
              filename: 'example-image-1.jpg',
              url: 'https://picsum.photos/400/300',
              metadata: {
                caption: 'Example image 1',
                source: 'Test source',
                tags: ['test', 'example']
              }
            }
          ],
          videos: [
            {
              id: uuidv4(),
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              title: 'Example Video',
              metadata: {
                description: 'Example video description',
                source: 'YouTube'
              }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // In a real implementation, fetch from the API
      const response = await api.get<ApiResponse<any>>(`/assets/${assetId}/training-data`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching training data:', error);
      throw new Error('Failed to fetch training data');
    }
  }
  
  /**
   * Update training data for an asset
   * @param assetId The ID of the asset
   * @param trainingData The updated training data
   * @returns The updated training data
   */
  async updateTrainingData(assetId: string, trainingData: any): Promise<any> {
    try {
      // Process the training data
      const processedData = prepareTrainingDataForSubmission(trainingData);
      
      // If using mock data, return a simulated response
      if (this.useMockData) {
        console.log('Using mock data for training data update', processedData);
        
        return {
          id: assetId,
          trainingData: {
            id: uuidv4(),
            assetId,
            isTrainable: trainingData.isTrainable,
            methodology: trainingData.trainingMethodology,
            datasetInfo: trainingData.trainingDatasetInfo,
            promptCount: (trainingData.prompts || []).length,
            imageCount: (trainingData.referenceImages || []).length,
            videoCount: (trainingData.referenceVideoUrls || []).length,
            otherFileCount: (trainingData.otherFiles || []).length,
            updatedAt: new Date().toISOString()
          }
        };
      }
      
      // In a real implementation, update via the API
      const response = await api.put<ApiResponse<any>>(
        `/assets/${assetId}/training-data`,
        processedData
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating training data:', error);
      throw new Error('Failed to update training data');
    }
  }
  
  /**
   * Add a prompt to training data
   * @param assetId The ID of the asset
   * @param prompt The prompt text
   * @param category Optional category
   * @returns The updated training data
   */
  async addPrompt(assetId: string, prompt: string, category?: string, metadata?: any): Promise<any> {
    try {
      const promptData = {
        text: prompt,
        category: category || 'general',
        ...metadata
      };
      
      // If using mock data, return a simulated response
      if (this.useMockData) {
        console.log('Using mock data for adding prompt', promptData);
        
        return {
          id: uuidv4(),
          assetId,
          ...promptData,
          createdAt: new Date().toISOString()
        };
      }
      
      // In a real implementation, submit to the API
      const response = await api.post<ApiResponse<any>>(
        `/assets/${assetId}/training-data/prompts`,
        promptData
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding prompt:', error);
      throw new Error('Failed to add prompt');
    }
  }
}

// Create a singleton instance
const trainingDataService = new TrainingDataService();

export default trainingDataService;