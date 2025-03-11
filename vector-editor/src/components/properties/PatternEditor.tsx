import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Slider,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';

// Built-in pattern presets
const builtInPatterns = [
  { id: 'stripes', name: 'Stripes', url: '/patterns/stripes.svg' },
  { id: 'dots', name: 'Dots', url: '/patterns/dots.svg' },
  { id: 'grid', name: 'Grid', url: '/patterns/grid.svg' },
  { id: 'zigzag', name: 'Zigzag', url: '/patterns/zigzag.svg' },
  { id: 'checker', name: 'Checker', url: '/patterns/checker.svg' }
];

// Default pattern config
const defaultPatternConfig = {
  source: 'builtin',
  patternId: 'stripes',
  customUrl: '',
  repeat: 'repeat',
  scale: 1
};

export interface PatternConfig {
  source: 'builtin' | 'custom';
  patternId?: string;
  customUrl?: string;
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  scale: number;
}

interface PatternEditorProps {
  onApply: (pattern: PatternConfig) => void;
  onCancel: () => void;
  initialPattern?: PatternConfig;
}

const PatternEditor: React.FC<PatternEditorProps> = ({
  onApply,
  onCancel,
  initialPattern
}) => {
  const [patternConfig, setPatternConfig] = useState<PatternConfig>(
    initialPattern ? initialPattern : defaultPatternConfig as PatternConfig
  );
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialPattern?.source === 'custom' && initialPattern?.customUrl
      ? initialPattern.customUrl
      : builtInPatterns.find(p => p.id === (initialPattern?.patternId || 'stripes'))?.url || builtInPatterns[0].url
  );

  // Update pattern config when user changes settings
  const handleConfigChange = (key: keyof PatternConfig, value: any) => {
    setPatternConfig(prev => ({
      ...prev,
      [key]: value
    }));

    // Update preview URL based on source
    if (key === 'source') {
      if (value === 'builtin') {
        const url = builtInPatterns.find(p => p.id === patternConfig.patternId)?.url || builtInPatterns[0].url;
        setPreviewUrl(url);
      } else if (value === 'custom' && patternConfig.customUrl) {
        setPreviewUrl(patternConfig.customUrl);
      }
    } else if (key === 'patternId' && patternConfig.source === 'builtin') {
      const url = builtInPatterns.find(p => p.id === value)?.url || builtInPatterns[0].url;
      setPreviewUrl(url);
    } else if (key === 'customUrl' && patternConfig.source === 'custom') {
      setPreviewUrl(value);
    }
  };

  // Handle custom URL input
  const handleCustomUrlChange = (url: string) => {
    handleConfigChange('customUrl', url);
    if (patternConfig.source === 'custom') {
      setPreviewUrl(url);
    }
  };

  // Get preview style
  const getPreviewStyle = () => {
    return {
      width: '100%',
      height: '120px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundImage: `url(${previewUrl})`,
      backgroundRepeat: patternConfig.repeat,
      backgroundSize: `${patternConfig.scale * 100}%`,
      marginBottom: '16px'
    };
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Pattern Editor</Typography>
      
      {/* Pattern Preview */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Preview</Typography>
        <div style={getPreviewStyle()} />
      </Box>
      
      {/* Pattern Source */}
      <Typography variant="subtitle2" gutterBottom>Pattern Source</Typography>
      <RadioGroup
        row
        value={patternConfig.source}
        onChange={(e) => handleConfigChange('source', e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="builtin" control={<Radio />} label="Built-in" />
        <FormControlLabel value="custom" control={<Radio />} label="Custom URL" />
      </RadioGroup>
      
      {/* Pattern Selection */}
      {patternConfig.source === 'builtin' ? (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Pattern</InputLabel>
          <Select
            value={patternConfig.patternId}
            onChange={(e) => handleConfigChange('patternId', e.target.value)}
            label="Pattern"
          >
            {builtInPatterns.map(pattern => (
              <MenuItem key={pattern.id} value={pattern.id}>
                {pattern.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Image URL</InputLabel>
          <input
            type="text"
            value={patternConfig.customUrl}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            placeholder="Enter image URL"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              marginTop: '8px'
            }}
          />
        </FormControl>
      )}
      
      {/* Pattern Repeat */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Repeat</InputLabel>
        <Select
          value={patternConfig.repeat}
          onChange={(e) => handleConfigChange('repeat', e.target.value)}
          label="Repeat"
        >
          <MenuItem value="repeat">Repeat (both directions)</MenuItem>
          <MenuItem value="repeat-x">Repeat Horizontally</MenuItem>
          <MenuItem value="repeat-y">Repeat Vertically</MenuItem>
          <MenuItem value="no-repeat">No Repeat</MenuItem>
        </Select>
      </FormControl>
      
      {/* Pattern Scale */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Scale: {Math.round(patternConfig.scale * 100)}%
        </Typography>
        <Slider
          value={patternConfig.scale}
          onChange={(_, value) => handleConfigChange('scale', value)}
          min={0.1}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
        />
      </Box>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => onApply(patternConfig)}
          disabled={patternConfig.source === 'custom' && !patternConfig.customUrl}
        >
          Apply Pattern
        </Button>
      </Box>
    </Box>
  );
};

export default PatternEditor; 