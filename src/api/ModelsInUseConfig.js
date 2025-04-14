/**
 * Configuration file for models available for selection in training data
 * These models can be selected when indicating which AI models were used
 * to generate or train an NNA asset
 */

export const modelsInUse = [
  {
    id: 'mdl-001',
    name: 'Stable Diffusion',
    version: '3.0',
    type: 'text-to-image',
    description: 'General purpose text-to-image model',
    provider: 'Stability AI',
    documentationUrl: 'https://stability.ai/stable-diffusion'
  },
  {
    id: 'mdl-002',
    name: 'Midjourney',
    version: '6.0',
    type: 'text-to-image',
    description: 'High-quality artistic image generation',
    provider: 'Midjourney',
    documentationUrl: 'https://docs.midjourney.com/'
  },
  {
    id: 'mdl-003',
    name: 'DALL-E',
    version: '3',
    type: 'text-to-image',
    description: 'OpenAI\'s advanced text-to-image model',
    provider: 'OpenAI',
    documentationUrl: 'https://openai.com/dall-e-3'
  },
  {
    id: 'mdl-004',
    name: 'Runway Gen-2',
    version: '2.5',
    type: 'text-to-video',
    description: 'Advanced text-to-video generation',
    provider: 'Runway',
    documentationUrl: 'https://runwayml.com/'
  },
  {
    id: 'mdl-005',
    name: 'Flex',
    version: '1.0',
    type: 'text-to-video',
    description: 'Specialized video generation for motion',
    provider: 'ReViz',
    documentationUrl: 'https://reviz.ai/flex'
  },
  {
    id: 'mdl-006',
    name: 'Kling',
    version: '2.0',
    type: 'text-to-audio',
    description: 'Advanced audio generation from text',
    provider: 'ReViz',
    documentationUrl: 'https://reviz.ai/kling'
  },
  {
    id: 'mdl-007',
    name: 'Sora',
    version: '1.0',
    type: 'text-to-video',
    description: 'OpenAI\'s video generation model',
    provider: 'OpenAI',
    documentationUrl: 'https://openai.com/sora'
  },
  {
    id: 'mdl-008',
    name: 'Anthropic Claude',
    version: '3',
    type: 'text-to-text',
    description: 'Advanced large language model',
    provider: 'Anthropic',
    documentationUrl: 'https://anthropic.com/claude'
  }
];

// Group models by type for UI organization
export const modelsByType = modelsInUse.reduce((groups, model) => {
  if (!groups[model.type]) {
    groups[model.type] = [];
  }
  groups[model.type].push(model);
  return groups;
}, {});

// Function to get model by ID
export function getModelById(modelId) {
  return modelsInUse.find(model => model.id === modelId);
}

// Function to get models by type
export function getModelsByType(type) {
  return modelsByType[type] || [];
}

export default {
  modelsInUse,
  modelsByType,
  getModelById,
  getModelsByType
};