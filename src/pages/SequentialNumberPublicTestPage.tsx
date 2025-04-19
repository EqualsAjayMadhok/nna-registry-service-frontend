import React, { useState, useEffect } from 'react';
import nnaRegistryService from '../api/nnaRegistryService';

/**
 * A simple public test page for sequential numbering that doesn't require authentication
 * This is a standalone page with minimal styling and dependencies
 */
const SequentialNumberPublicTestPage: React.FC = () => {
  const [humanFriendlyName, setHumanFriendlyName] = useState<string>('');
  const [machineFriendlyAddress, setMachineFriendlyAddress] = useState<string>('');
  const [layer, setLayer] = useState<string>('S');
  const [category, setCategory] = useState<string>('Pop Music');
  const [subcategory, setSubcategory] = useState<string>('Base');

  // Generate addresses when component mounts or inputs change
  useEffect(() => {
    try {
      // Generate addresses
      const hfn = nnaRegistryService.generateHumanFriendlyName(
        layer, 
        category, 
        subcategory,
        1  // We always pass 1 as the sequential number
      );
      
      const mfa = nnaRegistryService.generateMachineFriendlyAddress(
        layer,
        category,
        subcategory,
        1  // We always pass 1 as the sequential number
      );
      
      setHumanFriendlyName(hfn);
      setMachineFriendlyAddress(mfa);
    } catch (error) {
      console.error('Error generating NNA addresses:', error);
    }
  }, [layer, category, subcategory]);

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
    marginBottom: '20px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '30px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '5px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>NNA Sequential Numbering Fix Test Page</h1>
        <p>This is a public test page demonstrating the fix for sequential numbering in NNA addresses.</p>
      </div>
      
      <div style={sectionStyle}>
        <h2>Current NNA Settings</h2>
        <p>All sequential numbers are forced to be at least "002" instead of "001".</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label>Layer</label>
            <select 
              value={layer}
              onChange={(e) => setLayer(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="S">Stars (S)</option>
              <option value="G">Songs (G)</option>
              <option value="L">Looks (L)</option>
              <option value="M">Moves (M)</option>
              <option value="W">Worlds (W)</option>
            </select>
          </div>
          
          <div>
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Subcategory</label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h2>Generated NNA Addresses</h2>
        <p>Note: Even though we're passing sequential number 1, the addresses show 002 instead of 001.</p>
        
        <div style={{ marginTop: '15px' }}>
          <h3>Human-Friendly Name:</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            padding: '10px', 
            backgroundColor: '#e0f7fa', 
            border: '1px solid #b2ebf2',
            borderRadius: '4px',
            marginBottom: '10px',
            fontSize: '18px'
          }}>
            {humanFriendlyName || 'Loading...'}
          </div>
          
          <h3>Machine-Friendly Address:</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            padding: '10px', 
            backgroundColor: '#e8f5e9', 
            border: '1px solid #c8e6c9',
            borderRadius: '4px',
            fontSize: '18px'
          }}>
            {machineFriendlyAddress || 'Loading...'}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          <strong>Implementation:</strong> We've modified the NNA Registry Service to force sequential numbers to be at least 2.
        </p>
        <p>
          <strong>Check console logs</strong> for detailed information about the NNA address generation process.
        </p>
        <div style={{ marginTop: '20px' }}>
          <button 
            style={buttonStyle}
            onClick={() => {
              // Force regeneration of addresses
              const hfn = nnaRegistryService.generateHumanFriendlyName(layer, category, subcategory, 1);
              const mfa = nnaRegistryService.generateMachineFriendlyAddress(layer, category, subcategory, 1);
              setHumanFriendlyName(hfn);
              setMachineFriendlyAddress(mfa);
            }}
          >
            Regenerate Addresses
          </button>
        </div>
      </div>
    </div>
  );
};

export default SequentialNumberPublicTestPage;