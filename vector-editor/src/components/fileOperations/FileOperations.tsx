import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { FileFormat } from '../../types';
import { exportToFormat, importFile } from '../../utils/fileOperations';
import './FileOperations.css';

interface FileOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  canvas: any;
  mode: 'export' | 'import';
}

const FileOperationsDialog: React.FC<FileOperationsDialogProps> = ({
  open,
  onClose,
  canvas,
  mode
}) => {
  const [exportFormat, setExportFormat] = useState<FileFormat>('svg');
  const [exportFilename, setExportFilename] = useState<string>('vector-drawing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<number>(0);

  const handleExport = () => {
    if (!canvas) {
      setError('Canvas is not available.');
      return;
    }

    try {
      exportToFormat(canvas as any, exportFormat, exportFilename);
      onClose();
    } catch (err) {
      setError(`Error exporting file: ${err}`);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !canvas) {
      setError('Please select a file to import and ensure the canvas is available.');
      return;
    }

    try {
      await importFile(selectedFile, canvas as any);
      onClose();
    } catch (err: any) {
      setError(`Error importing file: ${err.message || err}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleImportTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setImportTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {mode === 'export' ? 'Export Drawing' : 'Import File'}
      </DialogTitle>
      
      <DialogContent>
        {mode === 'export' ? (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="export-format-label">Format</InputLabel>
              <Select
                labelId="export-format-label"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as FileFormat)}
                label="Format"
              >
                <MenuItem value="svg">SVG (Scalable Vector Graphics)</MenuItem>
                <MenuItem value="json">JSON (Project File)</MenuItem>
                <MenuItem value="pdf">PDF (Portable Document Format)</MenuItem>
                <MenuItem value="eps">EPS (Encapsulated PostScript)</MenuItem>
                <MenuItem value="ai">AI (Adobe Illustrator)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Filename"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              helperText={`Will be saved as ${exportFilename}.${exportFormat}`}
            />
          </>
        ) : (
          <>
            <Tabs value={importTab} onChange={handleImportTabChange} aria-label="import tabs" sx={{ mb: 2 }}>
              <Tab label="File Upload" />
              <Tab label="Sample SVGs" />
            </Tabs>
            
            {importTab === 0 ? (
              <Box className="file-upload-container">
                <input
                  type="file"
                  id="fileInput"
                  accept=".svg,.json"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Supported formats: SVG, JSON (Project File)
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2">Select a sample SVG to import:</Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    const dummyFile = new File(['<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>'], 
                      'sample-circle.svg', 
                      { type: 'image/svg+xml' }
                    );
                    setSelectedFile(dummyFile);
                  }}
                >
                  Sample Circle
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    const dummyFile = new File(['<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="150" height="80" x="25" y="10" stroke="blue" stroke-width="3" fill="yellow" /></svg>'], 
                      'sample-rectangle.svg', 
                      { type: 'image/svg+xml' }
                    );
                    setSelectedFile(dummyFile);
                  }}
                >
                  Sample Rectangle
                </Button>
              </Box>
            )}
          </>
        )}
        
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={mode === 'export' ? handleExport : handleImport}
          variant="contained"
          disabled={mode === 'import' && !selectedFile}
        >
          {mode === 'export' ? 'Export' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileOperationsDialog; 