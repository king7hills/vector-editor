import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { FormatColorFill, PaletteOutlined, OpacityOutlined, Palette, ColorLens } from '@mui/icons-material';
import { PropertyPanelProps } from '../../types';
import './PropertyPanel.css';

// Types for ColorPickerDialog
interface ColorPickerDialogProps {
  open: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

// Color Picker Dialog Component
const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({ open, onClose, currentColor, onColorChange }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || '#000000');
  
  // Extended color palette
  const extendedColorPalette = [
    // Reds
    '#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#ff0000', '#cc0000', '#990000', '#660000',
    // Oranges
    '#ffcc99', '#ff9966', '#ff6633', '#ff3300', '#ff8000', '#cc6600', '#994c00', '#663300',
    // Yellows
    '#ffffcc', '#ffff99', '#ffff66', '#ffff33', '#ffff00', '#cccc00', '#999900', '#666600',
    // Greens
    '#ccffcc', '#99ff99', '#66ff66', '#33ff33', '#00ff00', '#00cc00', '#009900', '#006600',
    // Cyans
    '#ccffff', '#99ffff', '#66ffff', '#33ffff', '#00ffff', '#00cccc', '#009999', '#006666',
    // Blues
    '#ccccff', '#9999ff', '#6666ff', '#3333ff', '#0000ff', '#0000cc', '#000099', '#000066',
    // Purples
    '#ffccff', '#ff99ff', '#ff66ff', '#ff33ff', '#ff00ff', '#cc00cc', '#990099', '#660066',
    // Grays
    '#ffffff', '#e6e6e6', '#cccccc', '#b3b3b3', '#999999', '#666666', '#333333', '#000000',
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleApply = () => {
    onColorChange(selectedColor);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Select Color</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', p: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Current Color</Typography>
            <Box sx={{ 
              width: '100%', 
              height: 50, 
              bgcolor: selectedColor, 
              border: '1px solid #ddd',
              borderRadius: 1,
              mb: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ width: '50px', height: '50px', marginRight: '10px' }}
              />
              <TextField 
                fullWidth
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="Hex color code"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>Color Palette</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: '600px' }}>
            {extendedColorPalette.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: selectedColor === color ? '3px solid #333' : '1px solid #ccc',
                  borderRadius: '4px',
                  '&:hover': {
                    borderColor: '#555',
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease'
                  }
                }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" color="primary">Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  selectedObject, 
  onPropertyChange 
}) => {
  // State for color picker
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [colorProperty, setColorProperty] = useState<string>('fill');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  
  // Predefined color palette for quick selection
  const colorPalette = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black
    '#ffffff', // White
    '#ff8000', // Orange
    '#8000ff', // Purple
    '#ff0080', // Pink
    '#00ff80'  // Mint
  ];

  // Helper function to render common inputs
  const renderColorInput = (label: string, property: string, value: string, allowAdvanced: boolean = false) => (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={6}>
        <Typography variant="body2">{label}:</Typography>
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onPropertyChange(property, e.target.value)}
            style={{ width: '30px', height: '30px', marginRight: '8px' }}
          />
          <TextField 
            size="small"
            value={value} 
            onChange={(e) => onPropertyChange(property, e.target.value)}
            sx={{ width: '100px' }}
            variant="outlined"
          />
          {allowAdvanced && (
            <IconButton 
              size="small" 
              onClick={() => onPropertyChange('openFillEditor', true)}
              sx={{ ml: 1 }}
              title="Advanced Fill Options"
            >
              <PaletteOutlined fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Grid>
      
      {/* Color palette for quick selection */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {colorPalette.map((color: string, index: number) => (
            <Box
              key={index}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '2px',
                '&:hover': {
                  borderColor: '#333',
                }
              }}
              onClick={() => onPropertyChange(property, color)}
            />
          ))}
          
          <IconButton 
            size="small" 
            onClick={() => {
              setColorProperty(property);
              setCurrentColor(value);
              setShowColorPicker(true);
            }}
            sx={{ ml: 1 }}
            title="More Colors"
          >
            <ColorLens fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );

  const renderNumberInput = (label: string, property: string, value: number, min: number = 0, max: number = 100) => (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={6}>
        <Typography variant="body2">{label}:</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          type="number"
          size="small"
          value={value}
          onChange={(e) => onPropertyChange(property, parseFloat(e.target.value))}
          InputProps={{ inputProps: { min, max } }}
          sx={{ width: '100px' }}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  // Function to render the fill section with basic and advanced options
  const renderFillSection = () => {
    const fillType = typeof selectedObject?.fill === 'string' ? 'solid' : 
                     selectedObject?.fill instanceof Object ? 'advanced' : 'solid';
    
    const objectFillColor = fillType === 'solid' ? (selectedObject?.fill as string || '#000000') : '#000000';
    
    return (
      <>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <FormatColorFill fontSize="small" sx={{ mr: 1 }} />
          Fill
        </Typography>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2">Fill Type:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Palette />}
              onClick={() => onPropertyChange('openFillEditor', true)}
              fullWidth
            >
              {fillType === 'solid' ? 'Solid Color' : 'Advanced Fill'}
            </Button>
          </Grid>
        </Grid>
        
        {fillType === 'solid' && renderColorInput('Fill Color', 'fill', objectFillColor, true)}

        {/* Enhanced fill options */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth
              startIcon={<PaletteOutlined />}
              onClick={() => {
                setColorProperty('fill');
                setCurrentColor(objectFillColor);
                setShowColorPicker(true);
              }}
            >
              Open Color Picker
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };

  if (!selectedObject) {
    return (
      <Paper className="property-panel" elevation={2}>
        <Typography variant="subtitle1" sx={{ p: 2, color: 'text.secondary' }}>
          No object selected
        </Typography>
      </Paper>
    );
  }

  const objectType = selectedObject.type;
  
  // Common properties for all objects
  const fill = typeof selectedObject.fill === 'string' ? selectedObject.fill : '#ffffff';
  const stroke = selectedObject.stroke as string || '#000000';
  const strokeWidth = selectedObject.strokeWidth as number || 1;
  const opacity = selectedObject.opacity as number || 1;

  // Handle color picker change
  const handleColorChange = (color: string) => {
    onPropertyChange(colorProperty, color);
  };

  return (
    <Paper className="property-panel" elevation={2}>
      <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
        {objectType.charAt(0).toUpperCase() + objectType.slice(1)} Properties
      </Typography>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {/* Fill & Stroke */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Appearance</Typography>
        
        {/* Fill with advanced options */}
        {renderFillSection()}
        
        {/* Stroke color */}
        {renderColorInput('Stroke', 'stroke', stroke)}
        
        {/* Stroke width */}
        {renderNumberInput('Stroke Width', 'strokeWidth', strokeWidth, 0, 20)}
        
        {/* Opacity */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <OpacityOutlined fontSize="small" sx={{ mr: 1 }} />
              Opacity:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Slider
              value={opacity * 100}
              onChange={(_, newValue) => onPropertyChange('opacity', (newValue as number) / 100)}
              aria-labelledby="opacity-slider"
              min={0}
              max={100}
              size="small"
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Position & Size */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Position & Size</Typography>
        
        {/* Position */}
        {renderNumberInput('Left', 'left', selectedObject.left as number || 0, 0, 2000)}
        {renderNumberInput('Top', 'top', selectedObject.top as number || 0, 0, 2000)}
        
        {/* Size - only show for shapes that have width/height */}
        {(objectType === 'rect' || objectType === 'image' || objectType === 'textbox') && (
          <>
            {renderNumberInput('Width', 'width', (selectedObject as any).width || 0, 0, 2000)}
            {renderNumberInput('Height', 'height', (selectedObject as any).height || 0, 0, 2000)}
          </>
        )}
        
        {/* For circles and ellipses */}
        {objectType === 'circle' && renderNumberInput('Radius', 'radius', (selectedObject as any).radius || 0, 0, 1000)}
        {objectType === 'ellipse' && (
          <>
            {renderNumberInput('Radius X', 'rx', (selectedObject as any).rx || 0, 0, 1000)}
            {renderNumberInput('Radius Y', 'ry', (selectedObject as any).ry || 0, 0, 1000)}
          </>
        )}
        
        {/* Text properties - only show for text objects */}
        {(objectType === 'text' || objectType === 'textbox' || objectType === 'i-text') && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Text</Typography>
            
            {/* Font Family */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Font Family</InputLabel>
              <Select
                value={(selectedObject as any).fontFamily || 'Arial'}
                onChange={(e) => onPropertyChange('fontFamily', e.target.value)}
                label="Font Family"
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Helvetica">Helvetica</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
                <MenuItem value="Georgia">Georgia</MenuItem>
              </Select>
            </FormControl>
            
            {/* Font Size */}
            {renderNumberInput('Font Size', 'fontSize', (selectedObject as any).fontSize || 16, 8, 72)}
            
            {/* Text Color already handled by fill */}
            
            {/* Font Weight */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Font Weight</InputLabel>
              <Select
                value={(selectedObject as any).fontWeight || 'normal'}
                onChange={(e) => onPropertyChange('fontWeight', e.target.value)}
                label="Font Weight"
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
              </Select>
            </FormControl>
            
            {/* Text Alignment */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Text Align</InputLabel>
              <Select
                value={(selectedObject as any).textAlign || 'left'}
                onChange={(e) => onPropertyChange('textAlign', e.target.value)}
                label="Text Align"
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
            </FormControl>
            
            {/* Bold, Italic, Underline */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={(selectedObject as any).fontWeight === 'bold'}
                      onChange={(e) => onPropertyChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
                      size="small"
                    />
                  }
                  label="Bold"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={(selectedObject as any).fontStyle === 'italic'}
                      onChange={(e) => onPropertyChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
                      size="small"
                    />
                  }
                  label="Italic"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={(selectedObject as any).underline}
                      onChange={(e) => onPropertyChange('underline', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Underline"
                />
              </Grid>
            </Grid>
          </>
        )}
        
        {/* Actions */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={() => onPropertyChange('delete', true)}
          >
            Delete
          </Button>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => onPropertyChange('clone', true)}
          >
            Duplicate
          </Button>
        </Box>
      </Box>
      
      {/* Color Picker Dialog */}
      <ColorPickerDialog
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={currentColor}
        onColorChange={handleColorChange}
      />
    </Paper>
  );
};

export default PropertyPanel; 