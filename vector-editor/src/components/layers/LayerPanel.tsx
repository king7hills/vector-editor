import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Switch,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { Layer } from '../../types';
import './LayerPanel.css';

interface LayerPanelProps {
  layers: Layer[];
  currentLayerId: string | null;
  onLayerAdd: (name: string) => void;
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void;
  onLayerToggleVisibility: (id: string) => void;
  onLayerToggleLock: (id: string) => void;
  onLayerRename: (id: string, newName: string) => void;
  onLayerReorder: (id: string, direction: 'up' | 'down') => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  currentLayerId,
  onLayerAdd,
  onLayerDelete,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerRename,
  onLayerReorder
}) => {
  const [newLayerDialogOpen, setNewLayerDialogOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [layerToRename, setLayerToRename] = useState<{ id: string; name: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; layerId: string } | null>(null);

  const handleNewLayer = () => {
    if (newLayerName.trim()) {
      onLayerAdd(newLayerName.trim());
      setNewLayerName('');
      setNewLayerDialogOpen(false);
    }
  };

  const handleRenameLayer = () => {
    if (layerToRename && layerToRename.name.trim()) {
      onLayerRename(layerToRename.id, layerToRename.name.trim());
      setLayerToRename(null);
      setRenameDialogOpen(false);
    }
  };

  const openRenameDialog = (id: string, currentName: string) => {
    setLayerToRename({ id, name: currentName });
    setRenameDialogOpen(true);
  };

  const handleContextMenu = (event: React.MouseEvent, layerId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      layerId
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  return (
    <Paper className="layer-panel" elevation={2}>
      <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Layers
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setNewLayerDialogOpen(true)}
        >
          Add
        </Button>
      </Typography>
      
      <Divider />
      
      <List dense sx={{ p: 0 }}>
        {layers.length === 0 ? (
          <ListItem sx={{ justifyContent: 'center', color: 'text.secondary', py: 2 }}>
            <Typography variant="body2">No layers. Create one to get started.</Typography>
          </ListItem>
        ) : (
          layers.map((layer) => (
            <ListItemButton
              key={layer.id}
              selected={currentLayerId === layer.id}
              onClick={() => onLayerSelect(layer.id)}
              onContextMenu={(e) => handleContextMenu(e, layer.id)}
              className={`layer-item ${currentLayerId === layer.id ? 'active-layer' : ''}`}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleVisibility(layer.id);
                  }}
                >
                  {layer.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                </IconButton>
              </ListItemIcon>
              
              <ListItemText 
                primary={layer.name} 
                secondary={`${layer.objects.length} object${layer.objects.length !== 1 ? 's' : ''}`}
                primaryTypographyProps={{ 
                  style: { 
                    fontWeight: currentLayerId === layer.id ? 'bold' : 'normal',
                    color: !layer.visible ? '#999' : 'inherit'
                  } 
                }}
              />
              
              <Box sx={{ display: 'flex' }}>
                <Tooltip title="Move Up">
                  <span>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerReorder(layer.id, 'up');
                      }}
                      disabled={layers.indexOf(layer) === 0}
                    >
                      <UpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Tooltip title="Move Down">
                  <span>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerReorder(layer.id, 'down');
                      }}
                      disabled={layers.indexOf(layer) === layers.length - 1}
                    >
                      <DownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Tooltip title={layer.locked ? "Unlock Layer" : "Lock Layer"}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                  >
                    {layer.locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="More Options">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, layer.id);
                    }}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemButton>
          ))
        )}
      </List>
      
      {/* New Layer Dialog */}
      <Dialog open={newLayerDialogOpen} onClose={() => setNewLayerDialogOpen(false)}>
        <DialogTitle>New Layer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layer Name"
            fullWidth
            variant="outlined"
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewLayerDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewLayer} variant="contained" disabled={!newLayerName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Layer Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Layer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layer Name"
            fullWidth
            variant="outlined"
            value={layerToRename?.name || ''}
            onChange={(e) => setLayerToRename(prev => prev ? { ...prev, name: e.target.value } : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRenameLayer} 
            variant="contained" 
            disabled={!layerToRename || !layerToRename.name.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (contextMenu) {
            const layer = layers.find(l => l.id === contextMenu.layerId);
            if (layer) {
              openRenameDialog(layer.id, layer.name);
            }
          }
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (contextMenu) {
            onLayerToggleVisibility(contextMenu.layerId);
          }
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            {layers.find(l => l.id === contextMenu?.layerId)?.visible 
              ? <VisibilityOffIcon fontSize="small" /> 
              : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {layers.find(l => l.id === contextMenu?.layerId)?.visible 
              ? 'Hide Layer' 
              : 'Show Layer'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (contextMenu) {
            onLayerToggleLock(contextMenu.layerId);
          }
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            {layers.find(l => l.id === contextMenu?.layerId)?.locked 
              ? <LockOpenIcon fontSize="small" /> 
              : <LockIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {layers.find(l => l.id === contextMenu?.layerId)?.locked 
              ? 'Unlock Layer' 
              : 'Lock Layer'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            if (contextMenu) {
              onLayerDelete(contextMenu.layerId);
            }
            handleContextMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default LayerPanel; 