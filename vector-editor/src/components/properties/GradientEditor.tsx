import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Slider,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { GradientOptions, GradientStop, GradientType } from '../../utils/fillStyles';

interface GradientEditorProps {
  onApply: (gradient: GradientOptions) => void;
  onCancel: () => void;
  initialGradient?: GradientOptions;
}

// Default gradient options
const defaultLinearGradient: GradientOptions = {
  type: 'linear',
  stops: [
    { offset: 0, color: '#ffffff' },
    { offset: 1, color: '#000000' }
  ],
  coords: { x1: 0, y1: 0, x2: 100, y2: 0 }
};

const defaultRadialGradient: GradientOptions = {
  type: 'radial',
  stops: [
    { offset: 0, color: '#ffffff' },
    { offset: 1, color: '#000000' }
  ],
  coords: { x1: 50, y1: 50, x2: 50, y2: 50, r1: 0, r2: 50 }
};

const GradientEditor: React.FC<GradientEditorProps> = ({
  onApply,
  onCancel,
  initialGradient
}) => {
  // State for gradient options
  const [gradientType, setGradientType] = useState<GradientType>(
    initialGradient?.type || 'linear'
  );
  const [stops, setStops] = useState<GradientStop[]>(
    initialGradient?.stops || defaultLinearGradient.stops
  );
  const [angle, setAngle] = useState<number>(
    initialGradient?.type === 'linear' 
      ? calculateAngle(initialGradient.coords) 
      : 0
  );
  const [radius, setRadius] = useState<number>(
    initialGradient?.type === 'radial' && initialGradient.coords?.r2
      ? initialGradient.coords.r2
      : 50
  );

  // Calculate angle from coordinates
  function calculateAngle(coords?: { x1?: number; y1?: number; x2?: number; y2?: number }) {
    if (!coords || coords.x1 === undefined || coords.y1 === undefined || 
        coords.x2 === undefined || coords.y2 === undefined) {
      return 0;
    }
    
    const dx = coords.x2 - coords.x1;
    const dy = coords.y2 - coords.y1;
    const angleRad = Math.atan2(dy, dx);
    return (angleRad * 180 / Math.PI) % 360;
  }

  // Reset stops when gradient type changes
  useEffect(() => {
    if (gradientType === 'linear') {
      setStops(stops.length < 2 ? defaultLinearGradient.stops : stops);
    } else {
      setStops(stops.length < 2 ? defaultRadialGradient.stops : stops);
    }
  }, [gradientType]);

  // Handle adding a new stop
  const handleAddStop = () => {
    if (stops.length >= 10) return; // Limit number of stops
    
    // Find a good position for the new stop
    const existingOffsets = stops.map(stop => stop.offset);
    let newOffset = 0.5; // Default middle point
    
    // Try to find a gap
    for (let i = 0; i < existingOffsets.length - 1; i++) {
      const gap = existingOffsets[i + 1] - existingOffsets[i];
      if (gap > 0.2) {
        newOffset = existingOffsets[i] + gap / 2;
        break;
      }
    }
    
    // Add a new stop
    const newStops = [...stops, { offset: newOffset, color: '#888888' }];
    
    // Sort stops by offset
    newStops.sort((a, b) => a.offset - b.offset);
    
    setStops(newStops);
  };

  // Handle removing a stop
  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) return; // Need at least 2 stops
    
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  // Handle changing a stop's color
  const handleColorChange = (index: number, color: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], color };
    setStops(newStops);
  };

  // Handle changing a stop's position
  const handleOffsetChange = (index: number, offset: number) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], offset: Math.min(1, Math.max(0, offset)) };
    
    // Sort stops by offset
    newStops.sort((a, b) => a.offset - b.offset);
    
    setStops(newStops);
  };

  // Generate gradient CSS for preview
  const getGradientStyle = () => {
    const stopsCss = stops.map(stop => `${stop.color} ${stop.offset * 100}%`).join(', ');
    
    if (gradientType === 'linear') {
      return {
        background: `linear-gradient(${angle}deg, ${stopsCss})`,
        height: '60px',
        width: '100%',
        borderRadius: '4px',
        marginBottom: '16px'
      };
    } else {
      return {
        background: `radial-gradient(circle, ${stopsCss})`,
        height: '120px',
        width: '100%',
        borderRadius: '4px',
        marginBottom: '16px'
      };
    }
  };

  // Handle applying the gradient
  const handleApply = () => {
    let gradientOptions: GradientOptions = {
      type: gradientType,
      stops: [...stops]
    };
    
    // Add appropriate coordinates based on gradient type
    if (gradientType === 'linear') {
      // Convert angle to coordinates
      const angleRad = angle * Math.PI / 180;
      const x1 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50);
      const y1 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50);
      const x2 = Math.round(50 + Math.sin(angleRad) * 50);
      const y2 = Math.round(50 + Math.cos(angleRad) * 50);
      
      gradientOptions.coords = { x1, y1, x2, y2 };
    } else {
      gradientOptions.coords = { x1: 50, y1: 50, x2: 50, y2: 50, r1: 0, r2: radius };
    }
    
    onApply(gradientOptions);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Gradient Editor</Typography>
      
      {/* Preview */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Preview</Typography>
        <div style={getGradientStyle()} />
      </Box>
      
      {/* Gradient Type */}
      <Typography variant="subtitle2" gutterBottom>Gradient Type</Typography>
      <RadioGroup
        row
        value={gradientType}
        onChange={(e) => setGradientType(e.target.value as GradientType)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="linear" control={<Radio />} label="Linear" />
        <FormControlLabel value="radial" control={<Radio />} label="Radial" />
      </RadioGroup>
      
      {/* Gradient Properties */}
      {gradientType === 'linear' ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Angle: {angle}°</Typography>
          <Slider
            value={angle}
            onChange={(_, value) => setAngle(value as number)}
            min={0}
            max={360}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Radius: {radius}%</Typography>
          <Slider
            value={radius}
            onChange={(_, value) => setRadius(value as number)}
            min={1}
            max={100}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
      
      {/* Color Stops */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
          Color Stops
          <Button 
            startIcon={<AddIcon />} 
            size="small" 
            onClick={handleAddStop}
            disabled={stops.length >= 10}
          >
            Add Stop
          </Button>
        </Typography>
        
        {stops.map((stop, index) => (
          <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
            <Grid item xs={1}>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveStop(index)}
                disabled={stops.length <= 2}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
            
            <Grid item xs={5}>
              <input
                type="color"
                value={stop.color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                style={{ width: '100%', height: '30px' }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <Slider
                value={stop.offset * 100}
                onChange={(_, value) => handleOffsetChange(index, (value as number) / 100)}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        ))}
      </Box>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>Apply Gradient</Button>
      </Box>
    </Box>
  );
};

export default GradientEditor; 