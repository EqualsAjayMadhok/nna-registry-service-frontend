import { 
  Asset,
  AssetRights,
  RightsStatus,
  RightsType,
  RightsLimitation,
  RightsVerificationMethod,
  RightsClearance,
  RightsUsage,
  RightsVerificationRequest,
  RightsUpdateRequest,
  RightsClearanceRequest
} from '../types/asset.types';
import api from '../services/api/api';
import { ApiResponse } from '../types/api.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing asset rights and integrating with the Clearity service
 */
class RightsService {
  // Flag to use mock data for development
  private useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
    (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
  
  /**
   * Get rights information for an asset
   */
  async getAssetRights(assetId: string): Promise<AssetRights> {
    try {
      if (this.useMockData) {
        return this.getMockRights(assetId);
      }
      
      const response = await api.get<ApiResponse<AssetRights>>(`/assets/${assetId}/rights`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching asset rights:', error);
      throw new Error('Failed to fetch asset rights information');
    }
  }
  
  /**
   * Update rights information for an asset
   */
  async updateAssetRights(request: RightsUpdateRequest): Promise<AssetRights> {
    try {
      if (this.useMockData) {
        return this.updateMockRights(request);
      }
      
      const response = await api.put<ApiResponse<AssetRights>>(
        `/assets/${request.assetId}/rights`, 
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating asset rights:', error);
      throw new Error('Failed to update asset rights information');
    }
  }
  
  /**
   * Add a new rights clearance record
   */
  async addRightsClearance(request: RightsClearanceRequest): Promise<RightsClearance> {
    try {
      if (this.useMockData) {
        return this.addMockClearance(request);
      }
      
      // For actual implementation, we'd use FormData to handle file uploads
      const formData = new FormData();
      
      // Add all fields to the form data
      Object.entries(request).forEach(([key, value]) => {
        if (key === 'clearanceDoc' && value) {
          formData.append('clearanceDoc', value);
        } else if (key === 'limitations' && value) {
          formData.append('limitations', JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      const response = await api.post<ApiResponse<RightsClearance>>(
        `/assets/${request.assetId}/rights/clearances`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding rights clearance:', error);
      throw new Error('Failed to add rights clearance record');
    }
  }
  
  /**
   * Delete a rights clearance record
   */
  async deleteRightsClearance(assetId: string, clearanceId: string): Promise<void> {
    try {
      if (this.useMockData) {
        return this.deleteMockClearance(assetId, clearanceId);
      }
      
      await api.delete(`/assets/${assetId}/rights/clearances/${clearanceId}`);
    } catch (error) {
      console.error('Error deleting rights clearance:', error);
      throw new Error('Failed to delete rights clearance record');
    }
  }
  
  /**
   * Submit a verification request to the Clearity service
   */
  async submitVerificationRequest(request: RightsVerificationRequest): Promise<{ jobId: string }> {
    try {
      if (this.useMockData) {
        return this.submitMockVerification(request);
      }
      
      // For actual implementation, we'd use FormData to handle file uploads
      const formData = new FormData();
      
      // Add all fields to the form data
      Object.entries(request).forEach(([key, value]) => {
        if (key === 'evidenceFiles' && value) {
          (value as File[]).forEach(file => {
            formData.append('evidenceFiles', file);
          });
        } else if (key === 'rightTypes' && value) {
          formData.append('rightTypes', JSON.stringify(value));
        } else if (key === 'evidenceUrls' && value) {
          formData.append('evidenceUrls', JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      const response = await api.post<ApiResponse<{ jobId: string }>>(
        `/assets/${request.assetId}/rights/verify`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw new Error('Failed to submit verification request to Clearity service');
    }
  }
  
  /**
   * Check the status of a verification job
   */
  async checkVerificationStatus(assetId: string, jobId: string): Promise<{
    status: RightsStatus;
    completed: boolean;
    message?: string;
    details?: any;
  }> {
    try {
      if (this.useMockData) {
        return this.checkMockVerificationStatus(assetId, jobId);
      }
      
      const response = await api.get<ApiResponse<{
        status: RightsStatus;
        completed: boolean;
        message?: string;
        details?: any;
      }>>(`/assets/${assetId}/rights/verify/${jobId}`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw new Error('Failed to check verification status with Clearity service');
    }
  }
  
  /**
   * Log a new usage record for an asset
   */
  async logAssetUsage(usage: Omit<RightsUsage, 'id'>): Promise<RightsUsage> {
    try {
      if (this.useMockData) {
        return this.logMockUsage(usage);
      }
      
      const response = await api.post<ApiResponse<RightsUsage>>(
        `/assets/${usage.assetId}/rights/usage`, 
        usage
      );
      return response.data.data;
    } catch (error) {
      console.error('Error logging asset usage:', error);
      throw new Error('Failed to log asset usage');
    }
  }
  
  /**
   * Get usage history for an asset
   */
  async getAssetUsageHistory(assetId: string): Promise<RightsUsage[]> {
    try {
      if (this.useMockData) {
        return this.getMockUsageHistory(assetId);
      }
      
      const response = await api.get<ApiResponse<RightsUsage[]>>(
        `/assets/${assetId}/rights/usage`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching asset usage history:', error);
      throw new Error('Failed to fetch asset usage history');
    }
  }
  
  /**
   * Verify rights compliance for a specific usage scenario
   */
  async verifyUsageCompliance(
    assetId: string, 
    usageScenario: {
      purpose: string;
      platform: string;
      usageType: string;
      territory?: string;
      commercial?: boolean;
      derivative?: boolean;
    }
  ): Promise<{
    compliant: boolean;
    issues?: string[];
    limitations?: string[];
    requiresAttribution: boolean;
    attributionText?: string;
  }> {
    try {
      if (this.useMockData) {
        return this.verifyMockCompliance(assetId, usageScenario);
      }
      
      const response = await api.post<ApiResponse<{
        compliant: boolean;
        issues?: string[];
        limitations?: string[];
        requiresAttribution: boolean;
        attributionText?: string;
      }>>(`/assets/${assetId}/rights/compliance`, usageScenario);
      
      return response.data.data;
    } catch (error) {
      console.error('Error verifying usage compliance:', error);
      throw new Error('Failed to verify usage compliance');
    }
  }
  
  // Mock Data Methods
  
  /**
   * Generate mock rights data for an asset
   */
  private getMockRights(assetId: string): AssetRights {
    // Generate deterministic but seemingly random status based on asset ID
    const hash = this.hashString(assetId);
    const statusIndex = hash % 6;
    const statuses = [
      RightsStatus.VERIFIED,
      RightsStatus.PARTIAL,
      RightsStatus.PENDING,
      RightsStatus.UNVERIFIED,
      RightsStatus.REJECTED,
      RightsStatus.EXPIRED
    ];
    
    const status = statuses[statusIndex];
    
    // Generate mock clearances
    const clearances = this.generateMockClearances(assetId, status);
    
    // Generate mock usage records
    const usages = hash % 3 === 0 ? this.generateMockUsages(assetId) : [];
    
    return {
      status,
      clearances,
      usages,
      attributionRequired: hash % 2 === 0,
      commercialUse: hash % 3 !== 0,
      derivativeWorks: hash % 4 !== 0,
      pendingVerification: status === RightsStatus.PENDING,
      attributionText: hash % 2 === 0 ? `Credit: Asset #${assetId} from NNA Registry` : undefined,
      clarityJobId: status === RightsStatus.PENDING ? `job-${this.getSubstring(assetId, 8)}` : undefined,
      clarityLastChecked: new Date(Date.now() - (hash % 10) * 86400000).toISOString(),
      updateHistory: [
        {
          updatedAt: new Date(Date.now() - (hash % 10) * 86400000).toISOString(),
          updatedBy: 'system',
          changedFields: ['status'],
          previousStatus: RightsStatus.UNVERIFIED,
          notes: 'Initial rights verification'
        }
      ]
    };
  }
  
  /**
   * Generate mock clearance records for an asset
   */
  private generateMockClearances(assetId: string, status: RightsStatus): RightsClearance[] {
    const hash = this.hashString(assetId);
    const count = 1 + (hash % 3); // 1-3 clearances
    
    const clearances: RightsClearance[] = [];
    const rightTypes = Object.values(RightsType);
    
    for (let i = 0; i < count; i++) {
      const rightType = rightTypes[(hash + i) % rightTypes.length];
      const clearanceStatus = i === 0 ? status : 
        (hash % 2 === 0 ? RightsStatus.VERIFIED : RightsStatus.PENDING);
      
      clearances.push({
        id: `clearance-${assetId}-${i}`,
        rightType,
        status: clearanceStatus,
        source: hash % 2 === 0 ? 'Original Creation' : 'License',
        holder: `Rights Holder ${(hash + i) % 10}`,
        obtainedAt: new Date(Date.now() - (hash % 365) * 86400000).toISOString(),
        expiresAt: (hash + i) % 3 === 0 ? 
          new Date(Date.now() + 365 * 86400000).toISOString() : undefined,
        limitations: (hash + i) % 4 === 0 ? [
          {
            type: RightsLimitation.TIME,
            description: 'Time limited usage',
            startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 365 * 86400000).toISOString()
          }
        ] : undefined,
        verification: clearanceStatus !== RightsStatus.UNVERIFIED ? {
          id: `verification-${assetId}-${i}`,
          method: [
            RightsVerificationMethod.BLOCKCHAIN,
            RightsVerificationMethod.CONTRACT,
            RightsVerificationMethod.LICENSE
          ][(hash + i) % 3],
          status: clearanceStatus,
          verifiedBy: 'Clearity',
          verifiedAt: new Date(Date.now() - (hash % 30) * 86400000).toISOString(),
          expiresAt: clearanceStatus === RightsStatus.EXPIRED ?
            new Date(Date.now() - 1 * 86400000).toISOString() :
            new Date(Date.now() + 365 * 86400000).toISOString(),
          notes: `Verification notes for ${rightType}`
        } : undefined,
        licenseType: hash % 2 === 0 ? 'CC BY 4.0' : undefined,
        termsUrl: hash % 3 === 0 ? 'https://example.com/terms' : undefined,
        paymentRequired: (hash + i) % 5 === 0,
        notes: (hash + i) % 2 === 0 ? `Notes for ${rightType} clearance` : undefined
      });
    }
    
    return clearances;
  }
  
  /**
   * Generate mock usage records
   */
  private generateMockUsages(assetId: string): RightsUsage[] {
    const hash = this.hashString(assetId);
    const count = hash % 4; // 0-3 usages
    
    const usages: RightsUsage[] = [];
    
    for (let i = 0; i < count; i++) {
      usages.push({
        id: `usage-${assetId}-${i}`,
        assetId,
        usedBy: `user-${(hash + i) % 10}`,
        usedAt: new Date(Date.now() - (hash + i) % 60 * 86400000).toISOString(),
        purpose: ['Production', 'Prototype', 'Marketing', 'Social Media'][(hash + i) % 4],
        platform: ['Web', 'Mobile', 'Print', 'TV'][(hash + i) % 4],
        projectId: `project-${(hash + i) % 100}`,
        usageType: ['inclusion', 'derivative', 'reference'][(hash + i) % 3],
        status: ['active', 'completed', 'terminated'][(hash + i) % 3] as 'active' | 'completed' | 'terminated',
        reportedAt: new Date(Date.now() - (hash + i) % 30 * 86400000).toISOString()
      });
    }
    
    return usages;
  }
  
  /**
   * Update mock rights data
   */
  private updateMockRights(request: RightsUpdateRequest): AssetRights {
    // Start with existing mock rights
    const existingRights = this.getMockRights(request.assetId);
    
    // Apply updates
    const updatedRights: AssetRights = {
      ...existingRights,
      attributionText: request.attributionText !== undefined ? 
        request.attributionText : existingRights.attributionText,
      attributionRequired: request.attributionRequired !== undefined ? 
        request.attributionRequired : existingRights.attributionRequired,
      commercialUse: request.commercialUse !== undefined ? 
        request.commercialUse : existingRights.commercialUse,
      derivativeWorks: request.derivativeWorks !== undefined ? 
        request.derivativeWorks : existingRights.derivativeWorks,
      updateHistory: [
        {
          updatedAt: new Date().toISOString(),
          updatedBy: 'current-user',
          changedFields: Object.keys(request).filter(key => 
            key !== 'assetId' && key !== 'notes'
          ),
          previousStatus: existingRights.status,
          notes: request.notes
        },
        ...(existingRights.updateHistory || [])
      ]
    };
    
    // If we have clearance updates, apply them
    if (request.rightsClearances && request.rightsClearances.length > 0) {
      updatedRights.clearances = [...existingRights.clearances];
      
      // Update or add new clearances
      request.rightsClearances.forEach(newClearance => {
        if (newClearance.id) {
          // Update existing clearance
          const index = updatedRights.clearances.findIndex(c => c.id === newClearance.id);
          if (index !== -1) {
            updatedRights.clearances[index] = {
              ...updatedRights.clearances[index],
              ...newClearance,
              obtainedAt: updatedRights.clearances[index].obtainedAt // Preserve original obtain date
            };
          }
        } else if (newClearance.rightType) {
          // Add new clearance
          const id = `clearance-${request.assetId}-${updatedRights.clearances.length}`;
          updatedRights.clearances.push({
            id,
            rightType: newClearance.rightType,
            status: RightsStatus.UNVERIFIED,
            source: newClearance.source || 'Unknown',
            holder: newClearance.holder || 'Unknown',
            obtainedAt: new Date().toISOString(),
            ...newClearance
          });
        }
      });
    }
    
    // Remove clearances if requested
    if (request.clearanceIdsToRemove && request.clearanceIdsToRemove.length > 0) {
      updatedRights.clearances = updatedRights.clearances.filter(
        clearance => !request.clearanceIdsToRemove?.includes(clearance.id)
      );
    }
    
    // Update overall status based on clearances
    if (updatedRights.clearances.length === 0) {
      updatedRights.status = RightsStatus.UNVERIFIED;
    } else if (updatedRights.clearances.every(c => c.status === RightsStatus.VERIFIED)) {
      updatedRights.status = RightsStatus.VERIFIED;
    } else if (updatedRights.clearances.some(c => c.status === RightsStatus.VERIFIED)) {
      updatedRights.status = RightsStatus.PARTIAL;
    } else if (updatedRights.clearances.some(c => c.status === RightsStatus.REJECTED)) {
      updatedRights.status = RightsStatus.REJECTED;
    } else if (updatedRights.clearances.some(c => c.status === RightsStatus.PENDING)) {
      updatedRights.status = RightsStatus.PENDING;
    } else if (updatedRights.clearances.some(c => c.status === RightsStatus.EXPIRED)) {
      updatedRights.status = RightsStatus.EXPIRED;
    } else {
      updatedRights.status = RightsStatus.UNVERIFIED;
    }
    
    return updatedRights;
  }
  
  /**
   * Add a mock clearance record
   */
  private addMockClearance(request: RightsClearanceRequest): RightsClearance {
    const clearance: RightsClearance = {
      id: `clearance-${uuidv4()}`,
      rightType: request.rightType,
      status: RightsStatus.UNVERIFIED,
      source: request.source,
      holder: request.holder,
      obtainedAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
      limitations: request.limitations,
      licenseType: request.licenseType,
      termsUrl: request.termsUrl,
      paymentRequired: request.paymentRequired,
      paymentDetails: request.paymentDetails,
      notes: request.notes,
      // Mock file URL for clearance document if provided
      clearanceDocUrl: request.clearanceDoc ? 
        `https://example.com/documents/${request.clearanceDoc.name}` : undefined
    };
    
    return clearance;
  }
  
  /**
   * Delete a mock clearance record
   */
  private deleteMockClearance(assetId: string, clearanceId: string): void {
    // In a real implementation, this would delete the clearance
    // For mock data, we don't need to do anything
    return;
  }
  
  /**
   * Submit a mock verification request
   */
  private submitMockVerification(request: RightsVerificationRequest): { jobId: string } {
    return {
      jobId: `job-${uuidv4()}`
    };
  }
  
  /**
   * Check the status of a mock verification job
   */
  private checkMockVerificationStatus(assetId: string, jobId: string): {
    status: RightsStatus;
    completed: boolean;
    message?: string;
    details?: any;
  } {
    // Deterministic but seemingly random result based on job ID and asset ID
    const hash = this.hashString(jobId + assetId);
    
    // 70% chance of success, 20% pending, 10% rejected
    let status: RightsStatus;
    let completed: boolean;
    let message: string;
    
    if (hash % 10 < 7) {
      status = RightsStatus.VERIFIED;
      completed = true;
      message = 'Verification completed successfully';
    } else if (hash % 10 < 9) {
      status = RightsStatus.PENDING;
      completed = false;
      message = 'Verification in progress';
    } else {
      status = RightsStatus.REJECTED;
      completed = true;
      message = 'Verification failed: Unable to verify rights claims';
    }
    
    return {
      status,
      completed,
      message,
      details: completed ? {
        verifiedRights: hash % 10 < 7 ? [RightsType.COPYRIGHT, RightsType.ATTRIBUTION] : [],
        verificationTimestamp: new Date().toISOString(),
        verificationMethod: RightsVerificationMethod.BLOCKCHAIN,
        verificationId: `verify-${this.getSubstring(jobId, 8)}`
      } : undefined
    };
  }
  
  /**
   * Log a mock usage record
   */
  private logMockUsage(usage: Omit<RightsUsage, 'id'>): RightsUsage {
    return {
      id: `usage-${uuidv4()}`,
      ...usage,
      reportedAt: new Date().toISOString()
    };
  }
  
  /**
   * Get mock usage history
   */
  private getMockUsageHistory(assetId: string): RightsUsage[] {
    return this.generateMockUsages(assetId);
  }
  
  /**
   * Verify mock compliance for a usage scenario
   */
  private verifyMockCompliance(
    assetId: string, 
    usageScenario: {
      purpose: string;
      platform: string;
      usageType: string;
      territory?: string;
      commercial?: boolean;
      derivative?: boolean;
    }
  ): {
    compliant: boolean;
    issues?: string[];
    limitations?: string[];
    requiresAttribution: boolean;
    attributionText?: string;
  } {
    // Get mock rights for the asset
    const rights = this.getMockRights(assetId);
    
    // Check compliance based on rights and usage scenario
    const issues: string[] = [];
    const limitations: string[] = [];
    
    // Check commercial use
    if (usageScenario.commercial && !rights.commercialUse) {
      issues.push('Commercial use not permitted');
    }
    
    // Check derivative works
    if (usageScenario.usageType === 'derivative' && !rights.derivativeWorks) {
      issues.push('Derivative works not permitted');
    }
    
    // Check territory limitations if applicable
    const territoryLimitations = rights.clearances.flatMap(c => 
      c.limitations?.filter(l => l.type === RightsLimitation.TERRITORY) || []
    );
    if (
      usageScenario.territory && 
      territoryLimitations.length > 0 && 
      !territoryLimitations.some(l => 
        l.territories?.includes(usageScenario.territory || '')
      )
    ) {
      issues.push(`Usage not permitted in territory: ${usageScenario.territory}`);
    }
    
    // Check platform limitations if applicable
    const platformLimitations = rights.clearances.flatMap(c => 
      c.limitations?.filter(l => l.type === RightsLimitation.PLATFORM) || []
    );
    if (
      platformLimitations.length > 0 && 
      !platformLimitations.some(l => 
        l.platforms?.includes(usageScenario.platform)
      )
    ) {
      issues.push(`Usage not permitted on platform: ${usageScenario.platform}`);
    }
    
    // Check rights status
    if (
      rights.status === RightsStatus.REJECTED || 
      rights.status === RightsStatus.EXPIRED
    ) {
      issues.push(`Rights status is ${rights.status}, usage not permitted`);
    }
    
    // Add all limitations as information
    rights.clearances.forEach(c => {
      c.limitations?.forEach(l => {
        limitations.push(`${l.type}: ${l.description}`);
      });
    });
    
    return {
      compliant: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      limitations: limitations.length > 0 ? limitations : undefined,
      requiresAttribution: rights.attributionRequired,
      attributionText: rights.attributionRequired ? rights.attributionText : undefined
    };
  }
  
  /**
   * Simple hash function for strings
   */
  private hashString(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }
  
  /**
   * Get a substring of a string, handling various string formats
   */
  private getSubstring(str: string, length: number): string {
    // Remove any non-alphanumeric characters
    const cleanStr = str.replace(/[^a-zA-Z0-9]/g, '');
    return cleanStr.substring(0, length);
  }
}

export default new RightsService();