import React, { useState, useEffect } from 'react';
import nnaRegistryService from '../../api/nnaRegistryService';
import { FORCE_HIGHER_SEQUENTIAL } from '../../utils/nnaForceHigherSequential';

/**
 * This component demonstrates the forced sequential numbering fix in action
 */
const ForcedSequentialDemo: React.FC = () => {
  const [humanFriendlyName, setHumanFriendlyName] = useState<string>('');
  const [machineFriendlyAddress, setMachineFriendlyAddress] = useState<string>('');
  const [normalSequential, setNormalSequential] = useState<string>('001');
  const [forcedSequential, setForcedSequential] = useState<string>('002');
  const [layer, setLayer] = useState<string>('S');
  const [category, setCategory] = useState<string>('Pop Music');
  const [subcategory, setSubcategory] = useState<string>('Base');

  // Generate addresses when component mounts or inputs change
  useEffect(() => {
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
    
    // What the sequential would be without forcing
    setNormalSequential('001');
    
    // What the sequential is with forcing
    const forcedSeq = FORCE_HIGHER_SEQUENTIAL ? '002' : '001';
    setForcedSequential(forcedSeq);
  }, [layer, category, subcategory]);

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">NNA Forced Sequential Number Demo</h2>
      <p className="mb-4">
        This demonstrates how we're forcing sequential numbers to be at least 2 (002) for testing purposes.
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Layer</label>
          <select 
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="S">Stars (S)</option>
            <option value="G">Songs (G)</option>
            <option value="L">Looks (L)</option>
            <option value="M">Moves (M)</option>
            <option value="W">Worlds (W)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Subcategory</label>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Generated NNA Addresses (with sequential = 1)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Human-Friendly Name:</p>
              <p className="font-mono font-bold">{humanFriendlyName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Machine-Friendly Address:</p>
              <p className="font-mono font-bold">{machineFriendlyAddress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Sequential Number Comparison</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Normal Sequential:</p>
              <p className="font-mono font-bold">{normalSequential}</p>
              <p className="text-xs text-gray-500 mt-1">Without the fix</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Forced Sequential:</p>
              <p className="font-mono font-bold text-indigo-600">{forcedSequential}</p>
              <p className="text-xs text-gray-500 mt-1">With the fix (minimum value = 2)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Fix Implementation Details</h3>
          
          <p className="text-sm text-gray-700 mb-2">
            The fix is implemented in the <code className="font-mono text-green-700">nnaRegistryService.ts</code> file:
          </p>
          
          <pre className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
{`// IMPORTANT: Force sequential number to at least 2 for testing
const forceHigherSequential = true; // Toggle this for testing
const adjustedSequentialNumber = forceHigherSequential 
  ? Math.max(sequentialNumber, 2)
  : sequentialNumber;`}
          </pre>
          
          <p className="text-sm text-gray-700 mt-2">
            This adjustment is applied consistently across all NNA address generation methods.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForcedSequentialDemo;