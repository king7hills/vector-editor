import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import GradientEditor from './GradientEditor';
import PatternEditor from './PatternEditor';
import { GradientOptions } from '../../utils/fillStyles';
import { PatternConfig } from './PatternEditor';

export type FillType = 'solid' | 'gradient' | 'pattern';

export interface FillEditorProps {
  open: boolean;
  onClose: () => void;
  currentFill: any;
  onApply: (fill: any) => void;
}

const FillEditor: React.FC<FillEditorProps> = ({
  open,
  onClose,
  currentFill,
  onApply
}) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleApplyGradient = (gradient: GradientOptions) => {
    onApply({
      type: 'gradient',
      value: gradient
    });
  };

  const handleApplyPattern = (pattern: PatternConfig) => {
    onApply({
      type: 'pattern',
      value: pattern
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Gradient" />
        <Tab label="Pattern" />
      </Tabs>
      
      <DialogContent sx={{ p: 0 }}>
        {tabIndex === 0 && (
          <GradientEditor
            onApply={handleApplyGradient}
            onCancel={onClose}
            initialGradient={currentFill?.type === 'gradient' ? currentFill.value : undefined}
          />
        )}
        
        {tabIndex === 1 && (
          <PatternEditor
            onApply={handleApplyPattern}
            onCancel={onClose}
            initialPattern={currentFill?.type === 'pattern' ? currentFill.value : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FillEditor; 