import React from 'react';
import { 
  Toolbar as MuiToolbar, 
  Tooltip, 
  IconButton,
  Divider,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { 
  Undo, 
  Redo, 
  ZoomIn,
  ZoomOut,
  FileUpload,
  FileDownload,
  Info
} from '@mui/icons-material';
import './Toolbar.css';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onExport,
  onImport,
  canUndo,
  canRedo,
  zoom
}) => {
  return (
    <Paper className="top-toolbar" elevation={3}>
      <MuiToolbar variant="dense">
        <Typography variant="h6" className="app-title">
          Vector Editor
        </Typography>
        
        <Divider orientation="vertical" flexItem style={{ margin: '0 16px' }} />
        
        <Box className="toolbar-section">
          <Tooltip title="Import File">
            <IconButton onClick={onImport} size="medium">
              <FileUpload />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export File">
            <IconButton onClick={onExport} size="medium">
              <FileDownload />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider orientation="vertical" flexItem style={{ margin: '0 16px' }} />
        
        <Box className="toolbar-section">
          <Tooltip title="Undo">
            <span>
              <IconButton onClick={onUndo} disabled={!canUndo} size="medium">
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Redo">
            <span>
              <IconButton onClick={onRedo} disabled={!canRedo} size="medium">
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        
        <Divider orientation="vertical" flexItem style={{ margin: '0 16px' }} />
        
        <Box className="toolbar-section">
          <Tooltip title="Zoom Out">
            <IconButton onClick={onZoomOut} size="medium">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          
          <Typography variant="body2" style={{ margin: '0 8px' }}>
            {Math.round(zoom * 100)}%
          </Typography>
          
          <Tooltip title="Zoom In">
            <IconButton onClick={onZoomIn} size="medium">
              <ZoomIn />
            </IconButton>
          </Tooltip>
        </Box>
        
        <div className="toolbar-spacer" />
        
        <Box className="toolbar-section">
          <Tooltip title="About">
            <IconButton size="medium">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
      </MuiToolbar>
    </Paper>
  );
};

export default Toolbar; 