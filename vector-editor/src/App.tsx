import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, CssBaseline, Snackbar, Alert, Tab, Tabs } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';

import Canvas from './components/canvas/Canvas';
import Toolbar from './components/toolbar/Toolbar';
import LeftToolbar from './components/toolbar/LeftToolbar';
import PropertyPanel from './components/properties/PropertyPanel';
import LayerPanel from './components/layers/LayerPanel';
import FileOperationsDialog from './components/fileOperations/FileOperations';
import FillEditor from './components/properties/FillEditor';
import { ToolType, Layer } from './types';
import useHistory from './hooks/useHistory';
import { useKeyboardShortcuts, KeyboardShortcut } from './hooks/useKeyboardShortcuts';
import { createComplexGradient, createPatternFromImage, applyFillToObject } from './utils/fillStyles';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  // State for the canvas and editor
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState<boolean>(false);
  const [fileDialogMode, setFileDialogMode] = useState<'export' | 'import'>('export');
  const [sidebarTab, setSidebarTab] = useState<number>(0);
  const [fillEditorOpen, setFillEditorOpen] = useState<boolean>(false);
  const [currentFill, setCurrentFill] = useState<any>(null);
  
  // Color state
  const [fillColor, setFillColor] = useState<string>('#ff0000');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  
  // Layer management state
  const [layers, setLayers] = useState<Layer[]>([]);
  const [currentLayerId, setCurrentLayerId] = useState<string | null>(null);
  
  // Clipboard state for copy/paste
  const clipboardRef = useRef<fabric.Object | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Use custom hooks for history and keyboard shortcuts
  const { undo, redo, canUndo, canRedo, saveState } = useHistory(canvas);

  // Initialize default layer when canvas is first created
  useEffect(() => {
    if (canvas && layers.length === 0) {
      const defaultLayer: Layer = {
        id: uuidv4(),
        name: 'Layer 1',
        visible: true,
        locked: false,
        objects: []
      };
      
      setLayers([defaultLayer]);
      setCurrentLayerId(defaultLayer.id);
    }
  }, [canvas, layers]);

  // Synchronize color with newly created objects
  useEffect(() => {
    if (canvas) {
      const handleObjectAdded = (e: any) => {
        const obj = e.target;
        if (obj && !(obj as any).data?.isGridLine) {
          // Don't modify grid lines
          if (obj.type !== 'line' && obj.fill === null) {
            obj.set('fill', fillColor);
          } 
          if (obj.stroke === null) {
            obj.set('stroke', strokeColor);
          }
          canvas.renderAll();
        }
      };
      
      canvas.on('object:added', handleObjectAdded);
      
      return () => {
        canvas.off('object:added', handleObjectAdded);
      };
    }
  }, [canvas, fillColor, strokeColor]);

  // Handler for when canvas is initialized
  const handleCanvasCreated = useCallback((fabricCanvas: fabric.Canvas) => {
    console.log('Canvas created callback received in App component');
    setCanvas(fabricCanvas);
    
    // Mark grid lines to prevent color changes
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.type === 'line' && obj.stroke === '#ebebeb') {
        (obj as any).data = { isGridLine: true };
      }
    });
  }, []);

  // Handler for when canvas is updated
  const handleCanvasUpdated = useCallback(() => {
    if (!canvas) return;
    
    // Update history
    saveState();
    
    // Update layer objects
    if (currentLayerId) {
      const updatedLayers = [...layers];
      const currentLayerIndex = updatedLayers.findIndex(layer => layer.id === currentLayerId);
      
      if (currentLayerIndex !== -1) {
        // Filter out grid lines from the layer objects
        const nonGridObjects = canvas.getObjects().filter(obj => !(obj as any).data?.isGridLine);
        updatedLayers[currentLayerIndex].objects = nonGridObjects;
        setLayers(updatedLayers);
      }
    }
  }, [canvas, currentLayerId, layers, saveState]);

  // Handler for tool changes
  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
  }, []);

  // Handler for object selection
  const handleObjectSelected = useCallback((object: fabric.Object | null) => {
    setSelectedObject(object);
    
    // Update color states when an object is selected
    if (object) {
      if (object.fill && typeof object.fill === 'string') {
        setFillColor(object.fill);
      }
      
      if (object.stroke && typeof object.stroke === 'string') {
        setStrokeColor(object.stroke);
      }
    }
  }, []);

  // Handler for fill color changes
  const handleFillColorChange = useCallback((color: string) => {
    setFillColor(color);
    
    // Apply to selected object if one exists
    if (selectedObject && canvas) {
      selectedObject.set('fill', color);
      canvas.renderAll();
      handleCanvasUpdated();
    }
  }, [selectedObject, canvas, handleCanvasUpdated]);

  // Handler for stroke color changes
  const handleStrokeColorChange = useCallback((color: string) => {
    setStrokeColor(color);
    
    // Apply to selected object if one exists
    if (selectedObject && canvas) {
      selectedObject.set('stroke', color);
      canvas.renderAll();
      handleCanvasUpdated();
    }
  }, [selectedObject, canvas, handleCanvasUpdated]);

  // Handler for zoom in/out
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  }, []);

  // Handler for undo that also shows notification
  const handleUndo = useCallback(() => {
    undo();
    
    // Update selected object after undo
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
    }
    
    setNotification({
      open: true,
      message: 'Undo completed',
      severity: 'info'
    });
  }, [undo, canvas]);

  // Handler for redo that also shows notification
  const handleRedo = useCallback(() => {
    redo();
    
    // Update selected object after redo
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
    }
    
    setNotification({
      open: true,
      message: 'Redo completed',
      severity: 'info'
    });
  }, [redo, canvas]);

  // Handler for property changes
  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (!selectedObject || !canvas) return;

    if (property === 'delete') {
      canvas.remove(selectedObject);
      setSelectedObject(null);
      canvas.renderAll();
      handleCanvasUpdated();
      return;
    }

    if (property === 'clone') {
      selectedObject.clone().then((cloned: fabric.Object) => {
        cloned.set({
          left: (selectedObject.left || 0) + 20,
          top: (selectedObject.top || 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        handleCanvasUpdated();
      });
      return;
    }
    
    if (property === 'openFillEditor') {
      // Open fill editor
      const currentFillType = typeof selectedObject.fill === 'string' ? 'solid' : 
                            selectedObject.fill instanceof fabric.Pattern ? 'pattern' : 
                            selectedObject.fill instanceof fabric.Gradient ? 'gradient' : 'solid';
      
      setCurrentFill({
        type: currentFillType,
        value: selectedObject.fill
      });
      
      setFillEditorOpen(true);
      return;
    }

    // Handle regular property changes
    selectedObject.set({ [property]: value });
    canvas.renderAll();
    handleCanvasUpdated();
  }, [selectedObject, canvas, handleCanvasUpdated]);

  // File operations
  const handleFileExport = useCallback(() => {
    setFileDialogMode('export');
    setFileDialogOpen(true);
  }, []);

  const handleFileImport = useCallback(() => {
    setFileDialogMode('import');
    setFileDialogOpen(true);
  }, []);

  const handleFileDialogClose = useCallback(() => {
    setFileDialogOpen(false);
  }, []);

  // Layer operations
  const handleLayerAdd = useCallback((name: string) => {
    const newLayer: Layer = {
      id: uuidv4(),
      name,
      visible: true,
      locked: false,
      objects: []
    };
    
    setLayers(prevLayers => [...prevLayers, newLayer]);
    setCurrentLayerId(newLayer.id);
    
    // Clear canvas of all non-grid objects and re-render
    if (canvas) {
      canvas.getObjects().forEach(obj => {
        if (!(obj as any).data?.isGridLine) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    }
  }, [canvas]);

  const handleLayerSelect = useCallback((id: string) => {
    if (id === currentLayerId) return;
    
    // Save current layer state
    if (canvas && currentLayerId) {
      const updatedLayers = [...layers];
      const currentLayerIndex = updatedLayers.findIndex(layer => layer.id === currentLayerId);
      
      if (currentLayerIndex !== -1) {
        // Filter out grid lines
        const nonGridObjects = canvas.getObjects().filter(obj => !(obj as any).data?.isGridLine);
        updatedLayers[currentLayerIndex].objects = nonGridObjects;
        setLayers(updatedLayers);
      }
    }
    
    // Load new layer
    if (canvas) {
      // Remove all non-grid objects
      canvas.getObjects().forEach(obj => {
        if (!(obj as any).data?.isGridLine) {
          canvas.remove(obj);
        }
      });
      
      // Find selected layer and add its objects to canvas
      const selectedLayer = layers.find(layer => layer.id === id);
      if (selectedLayer) {
        selectedLayer.objects.forEach(obj => {
          canvas.add(obj);
        });
      }
      
      canvas.renderAll();
    }
    
    setCurrentLayerId(id);
  }, [canvas, currentLayerId, layers]);

  const handleLayerDelete = useCallback((id: string) => {
    // Prevent deleting the last layer
    if (layers.length <= 1) {
      setNotification({
        open: true,
        message: 'Cannot delete the last layer',
        severity: 'error'
      });
      return;
    }
    
    // Remove the layer
    const updatedLayers = layers.filter(layer => layer.id !== id);
    setLayers(updatedLayers);
    
    // If the current layer is deleted, select another one
    if (id === currentLayerId) {
      const newCurrentLayer = updatedLayers[0];
      setCurrentLayerId(newCurrentLayer.id);
      
      // Load the new current layer objects
      if (canvas && newCurrentLayer) {
        // Remove all non-grid objects
        canvas.getObjects().forEach(obj => {
          if (!(obj as any).data?.isGridLine) {
            canvas.remove(obj);
          }
        });
        
        // Add the objects from the new layer
        newCurrentLayer.objects.forEach(obj => {
          canvas.add(obj);
        });
        
        canvas.renderAll();
      }
    }
  }, [canvas, currentLayerId, layers]);

  const handleLayerToggleVisibility = useCallback((id: string) => {
    const updatedLayers = [...layers];
    const layerIndex = updatedLayers.findIndex(layer => layer.id === id);
    
    if (layerIndex !== -1) {
      updatedLayers[layerIndex].visible = !updatedLayers[layerIndex].visible;
      setLayers(updatedLayers);
      
      // Update canvas visibility if it's the current layer
      if (id === currentLayerId && canvas) {
        const isVisible = updatedLayers[layerIndex].visible;
        canvas.getObjects().forEach(obj => {
          if (!(obj as any).data?.isGridLine) {
            obj.visible = isVisible;
          }
        });
        canvas.renderAll();
      }
    }
  }, [canvas, currentLayerId, layers]);

  const handleLayerToggleLock = useCallback((id: string) => {
    const updatedLayers = [...layers];
    const layerIndex = updatedLayers.findIndex(layer => layer.id === id);
    
    if (layerIndex !== -1) {
      updatedLayers[layerIndex].locked = !updatedLayers[layerIndex].locked;
      setLayers(updatedLayers);
      
      // Update canvas objects if it's the current layer
      if (id === currentLayerId && canvas) {
        const isLocked = updatedLayers[layerIndex].locked;
        canvas.getObjects().forEach(obj => {
          if (!(obj as any).data?.isGridLine) {
            obj.selectable = !isLocked;
            obj.evented = !isLocked;
          }
        });
        canvas.renderAll();
      }
    }
  }, [canvas, currentLayerId, layers]);

  const handleLayerRename = useCallback((id: string, newName: string) => {
    const updatedLayers = [...layers];
    const layerIndex = updatedLayers.findIndex(layer => layer.id === id);
    
    if (layerIndex !== -1) {
      updatedLayers[layerIndex].name = newName;
      setLayers(updatedLayers);
    }
  }, [layers]);

  const handleLayerReorder = useCallback((id: string, direction: 'up' | 'down') => {
    const updatedLayers = [...layers];
    const layerIndex = updatedLayers.findIndex(layer => layer.id === id);
    
    if (layerIndex !== -1) {
      if (direction === 'up' && layerIndex > 0) {
        // Move layer up (swap with the layer above)
        [updatedLayers[layerIndex], updatedLayers[layerIndex - 1]] = 
        [updatedLayers[layerIndex - 1], updatedLayers[layerIndex]];
      } else if (direction === 'down' && layerIndex < updatedLayers.length - 1) {
        // Move layer down (swap with the layer below)
        [updatedLayers[layerIndex], updatedLayers[layerIndex + 1]] = 
        [updatedLayers[layerIndex + 1], updatedLayers[layerIndex]];
      }
      
      setLayers(updatedLayers);
    }
  }, [layers]);

  // Set up keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    { key: 'z', ctrl: true, action: handleUndo },
    { key: 'y', ctrl: true, action: handleRedo },
    { key: 'z', ctrl: true, shift: true, action: handleRedo },
    { key: 'Delete', action: () => {
      if (selectedObject && canvas) {
        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.renderAll();
        handleCanvasUpdated();
      }
    }},
    { key: 'Backspace', action: () => {
      if (selectedObject && canvas) {
        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.renderAll();
        handleCanvasUpdated();
      }
    }},
    { key: 'v', action: () => setCurrentTool('select') },
    { key: 'r', action: () => setCurrentTool('rectangle') },
    { key: 'e', action: () => setCurrentTool('ellipse') },
    { key: 'l', action: () => setCurrentTool('line') },
    { key: 'p', action: () => setCurrentTool('path') },
    { key: 't', action: () => setCurrentTool('text') },
    { key: 'h', action: () => setCurrentTool('pan') },
    { key: 'c', ctrl: true, action: () => {
      if (!selectedObject || !canvas) return;
      
      // Store the selected object for paste
      selectedObject.clone().then((cloned: fabric.Object) => {
        clipboardRef.current = cloned;
        
        setNotification({
          open: true,
          message: 'Object copied to clipboard',
          severity: 'info'
        });
      });
    }},
    { key: 'v', ctrl: true, action: () => {
      if (!clipboardRef.current || !canvas) return;
      
      clipboardRef.current.clone().then((clonedObj: fabric.Object) => {
        // Offset the pasted object slightly from the original
        clonedObj.set({
          left: (clipboardRef.current?.left || 0) + 20,
          top: (clipboardRef.current?.top || 0) + 20,
          evented: true,
        });
        
        // Add to canvas and activate
        canvas.add(clonedObj);
        canvas.setActiveObject(clonedObj);
        canvas.renderAll();
        handleCanvasUpdated();
        
        setNotification({
          open: true,
          message: 'Object pasted from clipboard',
          severity: 'info'
        });
      });
    }},
    { key: 's', ctrl: true, action: handleFileExport },
    { key: '=', ctrl: true, action: handleZoomIn },
    { key: '-', ctrl: true, action: handleZoomOut },
  ];
  
  // Use the keyboard shortcuts hook
  useKeyboardShortcuts(shortcuts);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Toolbar 
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoom={zoom}
          onExport={handleFileExport}
          onImport={handleFileImport}
        />
        
        <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 60px)', position: 'relative' }}>
          <LeftToolbar 
            currentTool={currentTool}
            onToolChange={handleToolChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            fillColor={fillColor}
            strokeColor={strokeColor}
            onFillColorChange={handleFillColorChange}
            onStrokeColorChange={handleStrokeColorChange}
          />
          
          <div style={{ marginLeft: '60px', display: 'flex', flex: 1, position: 'relative' }}>
            <div className="canvas-area">
              <Canvas 
                currentTool={currentTool} 
                zoom={zoom}
                onObjectSelected={handleObjectSelected}
                onCanvasUpdated={handleCanvasUpdated}
                onCanvasCreated={handleCanvasCreated}
              />
            </div>
            
            <div className="sidebar">
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={sidebarTab} onChange={(e, v) => setSidebarTab(v)}>
                  <Tab label="Properties" />
                  <Tab label="Layers" />
                </Tabs>
              </Box>
              
              {sidebarTab === 0 && (
                <PropertyPanel 
                  selectedObject={selectedObject} 
                  onPropertyChange={handlePropertyChange}
                />
              )}
              
              {sidebarTab === 1 && (
                <LayerPanel 
                  layers={layers}
                  currentLayerId={currentLayerId}
                  onLayerAdd={handleLayerAdd}
                  onLayerDelete={handleLayerDelete}
                  onLayerSelect={handleLayerSelect}
                  onLayerToggleVisibility={handleLayerToggleVisibility}
                  onLayerToggleLock={handleLayerToggleLock}
                  onLayerRename={handleLayerRename}
                  onLayerReorder={handleLayerReorder}
                />
              )}
            </div>
          </div>
        </div>
        
        <FileOperationsDialog 
          open={fileDialogOpen}
          onClose={handleFileDialogClose}
          canvas={canvas}
          mode={fileDialogMode}
        />
        
        <FillEditor 
          open={fillEditorOpen}
          onClose={() => setFillEditorOpen(false)}
          currentFill={currentFill}
          onApply={(fill) => {
            if (selectedObject && canvas) {
              applyFillToObject(selectedObject, fill);
              canvas.renderAll();
              handleCanvasUpdated();
              setFillEditorOpen(false);
            }
          }}
        />
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={3000} 
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default App;
