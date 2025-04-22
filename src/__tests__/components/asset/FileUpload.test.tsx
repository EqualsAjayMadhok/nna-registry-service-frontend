import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FileUpload from '../../../components/asset/FileUpload';
import { FileUploadResponse } from '../../../types/asset.types';

// Mock the asset service
vi.mock('../../../services/api/asset.service', () => ({
  default: {
    uploadFile: vi.fn().mockResolvedValue({
      id: 'test-upload-id',
      url: 'http://example.com/test.jpg',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      size: 1024
    })
  }
}));

describe('FileUpload', () => {
  const mockOnFilesChange = vi.fn();
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();
  const mockOnUploadProgress = vi.fn();

  const defaultProps = {
    onFilesChange: mockOnFilesChange,
    onUploadComplete: mockOnUploadComplete,
    onUploadError: mockOnUploadError,
    onUploadProgress: mockOnUploadProgress,
    acceptedFileTypes: 'image/*',
    maxFiles: 5,
    maxSize: 1024 * 1024 * 10, // 10MB
    layerCode: 'G'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with correct instructions', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText(/Drag and drop files/i)).toBeInTheDocument();
    expect(screen.getByText(/image\/\*/i)).toBeInTheDocument();
  });

  it('handles file selection through click', async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([file]);
    });
  });

  it('validates file type based on layer code', async () => {
    render(<FileUpload {...defaultProps} layerCode="G" />);

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/only accepts audio files/i)).toBeInTheDocument();
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });

  it('handles successful file upload', async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          id: 'test-upload-id',
          filename: 'test.jpg'
        })
      );
    });
  });

  it('handles file upload error', async () => {
    // Mock asset service to reject
    const assetService = (await import('../../../services/api/asset.service')).default;
    vi.spyOn(assetService, 'uploadFile').mockRejectedValueOnce(new Error('Upload failed'));

    render(<FileUpload {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.any(String),
        'Upload failed'
      );
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  it('enforces maximum file limit', async () => {
    render(<FileUpload {...defaultProps} maxFiles={2} />);

    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['test3'], 'test3.jpg', { type: 'image/jpeg' })
    ];

    const input = screen.getByRole('button', { name: /select files/i });
    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(screen.getByText(/maximum of 2 files/i)).toBeInTheDocument();
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });

  it('shows upload progress', async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUploadProgress).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number)
      );
    });
  });

  it('allows file removal', async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select files/i });

    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([]);
    });
  });
}); 