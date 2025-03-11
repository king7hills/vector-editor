import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Popover,
  Typography,
  Grid
} from '@mui/material';
import {
  PanTool as PanIcon,
  Crop169 as RectangleIcon,
  RadioButtonUnchecked as EllipseIcon,
  LinearScale as LineIcon,
  EditRoad as PathIcon,
  TextFields as TextIcon,
  Hexagon as PolygonIcon,
  HighlightAlt as SelectIcon,
  Palette as ColorIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Create as PencilIcon
} from '@mui/icons-material';
import { ToolType } from '../../types';
import { SketchPicker, ColorResult } from 'react-color';
import './LeftToolbar.css';

interface LeftToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fillColor: string;
  strokeColor: string;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
}

const LeftToolbar: React.FC<LeftToolbarProps> = ({
  currentTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  fillColor,
  strokeColor,
  onFillColorChange,
  onStrokeColorChange
}) => {
  const [fillColorAnchor, setFillColorAnchor] = useState<HTMLElement | null>(null);
  const [strokeColorAnchor, setStrokeColorAnchor] = useState<HTMLElement | null>(null);

  const handleFillColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setFillColorAnchor(event.currentTarget);
  };

  const handleStrokeColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setStrokeColorAnchor(event.currentTarget);
  };

  const handleFillColorClose = () => {
    setFillColorAnchor(null);
  };

  const handleStrokeColorClose = () => {
    setStrokeColorAnchor(null);
  };

  const fillColorOpen = Boolean(fillColorAnchor);
  const strokeColorOpen = Boolean(strokeColorAnchor);

  const toolButtons = [
    { tool: 'select', icon: <SelectIcon />, tooltip: 'Select & Move' },
    { tool: 'rectangle', icon: <RectangleIcon />, tooltip: 'Rectangle' },
    { tool: 'ellipse', icon: <EllipseIcon />, tooltip: 'Ellipse' },
    { tool: 'line', icon: <LineIcon />, tooltip: 'Line' },
    { tool: 'polygon', icon: <PolygonIcon />, tooltip: 'Polygon' },
    { tool: 'path', icon: <PathIcon />, tooltip: 'Path' },
    { tool: 'pencil', icon: <PencilIcon />, tooltip: 'Pencil' },
    { tool: 'text', icon: <TextIcon />, tooltip: 'Text' },
    { tool: 'pan', icon: <PanIcon />, tooltip: 'Pan' }
  ];

  return (
    <Paper 
      className="left-toolbar" 
      elevation={3}
      sx={{ 
        position: 'static',
        width: '60px', 
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box className="toolbar-section">
        <Typography variant="subtitle2" align="center" sx={{ fontSize: '0.8rem', my: 1 }}>
          Tools
        </Typography>
        <Grid container spacing={1} direction="column" alignItems="center">
          {toolButtons.map(({ tool, icon, tooltip }) => (
            <Grid item key={tool} sx={{ width: '100%' }}>
              <Tooltip title={tooltip} placement="right">
                <IconButton
                  size="small"
                  onClick={() => onToolChange(tool as ToolType)}
                  color={currentTool === tool ? 'primary' : 'default'}
                  sx={{
                    backgroundColor: currentTool === tool ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    width: '40px',
                    height: '40px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider style={{ margin: '8px 0' }} />

      <Box className="toolbar-section">
        <Typography variant="subtitle2" align="center" sx={{ fontSize: '0.8rem', my: 1 }}>
          Colors
        </Typography>
        <Grid container spacing={1} direction="column" alignItems="center">
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Fill Color" placement="right">
              <IconButton 
                size="small" 
                onClick={handleFillColorClick}
                sx={{ 
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  margin: '0 auto',
                  display: 'block'
                }}
              >
                <ColorIcon />
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 5, 
                    width: 12, 
                    height: 12, 
                    backgroundColor: fillColor,
                    border: '1px solid #ccc',
                    borderRadius: 2
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Popover
              open={fillColorOpen}
              anchorEl={fillColorAnchor}
              onClose={handleFillColorClose}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
            >
              <Box p={1}>
                <SketchPicker
                  color={fillColor}
                  onChangeComplete={(color: ColorResult) => onFillColorChange(color.hex)}
                />
              </Box>
            </Popover>
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Stroke Color" placement="right">
              <IconButton 
                size="small" 
                onClick={handleStrokeColorClick}
                sx={{ 
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  margin: '0 auto',
                  display: 'block'
                }}
              >
                <ColorIcon />
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 5, 
                    width: 12, 
                    height: 12, 
                    backgroundColor: strokeColor,
                    border: '1px solid #ccc',
                    borderRadius: 2
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Popover
              open={strokeColorOpen}
              anchorEl={strokeColorAnchor}
              onClose={handleStrokeColorClose}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
            >
              <Box p={1}>
                <SketchPicker
                  color={strokeColor}
                  onChangeComplete={(color: ColorResult) => onStrokeColorChange(color.hex)}
                />
              </Box>
            </Popover>
          </Grid>
        </Grid>
      </Box>

      <Divider style={{ margin: '8px 0' }} />

      <Box className="toolbar-section">
        <Typography variant="subtitle2" align="center" sx={{ fontSize: '0.8rem', my: 1 }}>
          Actions
        </Typography>
        <Grid container spacing={1} direction="column" alignItems="center">
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Undo" placement="right">
              <span style={{ display: 'block', textAlign: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={onUndo} 
                  disabled={!canUndo}
                  sx={{
                    width: '40px',
                    height: '40px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Redo" placement="right">
              <span style={{ display: 'block', textAlign: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={onRedo} 
                  disabled={!canRedo}
                  sx={{
                    width: '40px',
                    height: '40px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Zoom In" placement="right">
              <IconButton 
                size="small" 
                onClick={onZoomIn}
                sx={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto',
                  display: 'block'
                }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <Tooltip title="Zoom Out" placement="right">
              <IconButton 
                size="small" 
                onClick={onZoomOut}
                sx={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto',
                  display: 'block'
                }}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LeftToolbar; 