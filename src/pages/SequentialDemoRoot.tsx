import React, { useState, useEffect } from 'react';
import nnaRegistryService from '../api/nnaRegistryService';

/**
 * Ultra simple demo page at root level
 */
const SequentialDemoRoot: React.FC = () => {
  const [result, setResult] = useState<{
    humanFriendlyName: string;
    machineFriendlyAddress: string;
  }>({
    humanFriendlyName: '',
    machineFriendlyAddress: ''
  });

  useEffect(() => {
    try {
      // Use the Stars layer, Pop Music category, and Base subcategory as examples
      const layer = 'S';
      const category = 'Pop Music';
      const subcategory = 'Base';
      
      console.log('Generating NNA addresses...');
      
      // Always pass 1 as sequential number, but it should generate "002"
      const hfn = nnaRegistryService.generateHumanFriendlyName(layer, category, subcategory, 1);
      const mfa = nnaRegistryService.generateMachineFriendlyAddress(layer, category, subcategory, 1);
      
      console.log('HFN:', hfn);
      console.log('MFA:', mfa);
      
      setResult({
        humanFriendlyName: hfn,
        machineFriendlyAddress: mfa
      });
    } catch (error) {
      console.error('Error generating addresses:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>NNA Sequential Number Fix Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>This page demonstrates the sequential numbering fix for the NNA Registry Service.</p>
        <p>Even though we're passing sequential number <strong>1</strong>, the addresses will show <strong>002</strong> instead of 001.</p>
      </div>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2>Generated NNA Addresses:</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ marginBottom: '5px' }}>Human-Friendly Name:</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            padding: '10px', 
            backgroundColor: '#e0f7fa', 
            border: '1px solid #b2ebf2'
          }}>
            {result.humanFriendlyName || 'Loading...'}
          </div>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '5px' }}>Machine-Friendly Address:</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            padding: '10px', 
            backgroundColor: '#e8f5e9', 
            border: '1px solid #c8e6c9'
          }}>
            {result.machineFriendlyAddress || 'Loading...'}
          </div>
        </div>
      </div>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#fff3e0', 
        border: '1px solid #ffe0b2',
        borderRadius: '5px'
      }}>
        <h3>Implementation Details:</h3>
        <p>We've modified the core NNA service to force sequential numbers to be at least 2.</p>
        <pre style={{ 
          background: '#f9f9f9', 
          padding: '10px', 
          overflow: 'auto',
          fontSize: '14px'
        }}>
{`// IMPORTANT: Force sequential number to at least 2 for testing
const forceHigherSequential = true; // Toggle this for testing
const adjustedSequentialNumber = forceHigherSequential 
  ? Math.max(sequentialNumber, 2)
  : sequentialNumber;`}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#666' }}>
          NNA Registry Service - Version 1.1.0
        </p>
        <p>
          <a 
            href="https://github.com/EqualsAjayMadhok/nna-registry-service-frontend" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default SequentialDemoRoot;