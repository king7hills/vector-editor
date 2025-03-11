import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import * as fabric from 'fabric';
import { ToolType } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentTool: ToolType;
  zoom: number;
  onObjectSelected: (object: fabric.Object | null) => void;
  onCanvasUpdated: () => void;
  onCanvasCreated?: (canvas: fabric.Canvas) => void;
}

// Modified type to work with the Fabric.js event system
type FabricEvent = {
  e: Event | fabric.TPointerEvent;
  target?: fabric.Object;
  pointer?: { x: number; y: number };
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
};

const Canvas: React.FC<CanvasProps> = ({ 
  currentTool, 
  zoom, 
  onObjectSelected,
  onCanvasUpdated,
  onCanvasCreated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const isDrawing = useRef<boolean>(false);
  const currentObject = useRef<fabric.Object | null>(null);
  
  // Define updateCursor before it's used
  const updateCursor = useCallback(() => {
    if (!fabricCanvas) return;
    
    switch (currentTool) {
      case 'select':
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'move';
        break;
      case 'rectangle':
      case 'ellipse':
      case 'line':
      case 'path':
      case 'text':
        fabricCanvas.defaultCursor = 'crosshair';
        fabricCanvas.hoverCursor = 'crosshair';
        break;
      default:
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'default';
    }
  }, [currentTool, fabricCanvas]);

  // Initialize the canvas - using useLayoutEffect for DOM operations that need to happen before painting
  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    console.log('Initializing canvas element');
    
    // Clean up any existing canvas
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
    
    // Explicitly set canvas dimensions on the DOM element
    canvasRef.current.width = 1200;
    canvasRef.current.height = 800;
    
    // Create the fabric canvas instance
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
      selection: true, // Enable object selection by default
      renderOnAddRemove: true, // Ensure rendering happens on object changes
    });
    
    // Add a grid to the canvas for better visibility
    addGrid(canvas);
    
    // Add a test rectangle to ensure rendering is working
    const testRect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      fill: '#ff0000',  // Red fill for better visibility
      stroke: '#000000',
      strokeWidth: 2,
      selectable: true,
      hasControls: true
    });
    
    // Make sure the rectangle is added to the canvas and rendered
    canvas.add(testRect);
    
    // Log for debugging
    console.log('Canvas initialized with test rectangle:', testRect);
    console.log('Canvas objects count:', canvas.getObjects().length);
    
    // Set the canvas instance in state
    setFabricCanvas(canvas);
    
    // Notify parent that canvas is created
    if (onCanvasCreated) {
      onCanvasCreated(canvas);
    }
    
    // Force a canvas render
    canvas.setActiveObject(testRect);
    canvas.renderAll();
    
    // Force a canvas redraw after a short delay to ensure rendering
    setTimeout(() => {
      console.log('Forcing canvas redraw');
      if (canvas) {
        canvas.requestRenderAll();
      }
    }, 100);
    
    return () => {
      canvas.dispose();
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Apply zoom changes
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.setZoom(zoom);
      fabricCanvas.renderAll();
    }
  }, [zoom, fabricCanvas]);
  
  // Update cursor when tool changes
  useEffect(() => {
    if (fabricCanvas) {
      updateCursor();
    }
  }, [currentTool, fabricCanvas, updateCursor]);

  // Define the event handlers before they're used in useEffect
  const handleMouseDown = useCallback((options: FabricEvent) => {
    if (!fabricCanvas) return;

    // Get pointer position - safely handle both Event and fabric.TPointerEvent
    let pointer;
    if (options.pointer) {
      pointer = options.pointer;
    } else {
      pointer = fabricCanvas.getPointer(options.e as fabric.TPointerEvent);
    }

    isDrawing.current = true;
    console.log('Mouse down at', pointer.x, pointer.y, 'with tool', currentTool);

    switch (currentTool) {
      case 'select':
        // Selection is handled by Fabric.js by default
        break;
      case 'rectangle':
        currentObject.current = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#ff0000',  // Default red fill
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true,
          hasControls: true
        });
        fabricCanvas.add(currentObject.current);
        break;
      case 'ellipse':
        currentObject.current = new fabric.Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: '#ff0000',  // Default red fill
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true,
          hasControls: true
        });
        fabricCanvas.add(currentObject.current);
        break;
      case 'line':
        currentObject.current = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#000000',  // Default black stroke
          strokeWidth: 2,
          selectable: true,
          hasControls: true
        });
        fabricCanvas.add(currentObject.current);
        break;
      case 'polygon':
        // Polygon creation would be more complex and involve multiple clicks
        // This is a simplified version
        if (!currentObject.current) {
          // Create points array for polygon
          const points = [
            { x: pointer.x, y: pointer.y },
            { x: pointer.x, y: pointer.y }
          ];
          currentObject.current = new fabric.Polygon(points, {
            fill: '#ff0000',  // Default red fill
            stroke: '#000000',
            strokeWidth: 1,
            selectable: true,
            hasControls: true
          });
          fabricCanvas.add(currentObject.current);
        }
        break;
      case 'text':
        currentObject.current = new fabric.IText('Edit text', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: '#000000',  // Default black fill
          selectable: true,
          hasControls: true
        });
        fabricCanvas.add(currentObject.current);
        fabricCanvas.setActiveObject(currentObject.current);
        isDrawing.current = false; // No need to continue drawing for text
        break;
      case 'pan':
        fabricCanvas.defaultCursor = 'grabbing';
        fabricCanvas.relativePan(new fabric.Point(0, 0)); // Initialize panning
        break;
    }

    // Force a render to ensure the object appears immediately
    fabricCanvas.renderAll();
    
    // Log object creation for debugging
    if (currentObject.current) {
      console.log('Object created:', currentObject.current);
      console.log('Canvas objects count after creation:', fabricCanvas.getObjects().length);
    }
  }, [currentTool, fabricCanvas]);

  const handleMouseMove = useCallback((options: FabricEvent) => {
    if (!fabricCanvas || !isDrawing.current || !currentObject.current) return;

    // Get pointer position - safely handle both Event and fabric.TPointerEvent
    let pointer;
    if (options.pointer) {
      pointer = options.pointer;
    } else {
      pointer = fabricCanvas.getPointer(options.e as fabric.TPointerEvent);
    }

    switch (currentTool) {
      case 'rectangle':
        const rect = currentObject.current as fabric.Rect;
        const width = Math.max(1, Math.abs(pointer.x - rect.left!));
        const height = Math.max(1, Math.abs(pointer.y - rect.top!));
        rect.set({ width, height });
        break;
      case 'ellipse':
        const ellipse = currentObject.current as fabric.Ellipse;
        const rx = Math.max(1, Math.abs(pointer.x - ellipse.left!));
        const ry = Math.max(1, Math.abs(pointer.y - ellipse.top!));
        ellipse.set({ rx, ry });
        break;
      case 'line':
        const line = currentObject.current as fabric.Line;
        line.set({ x2: pointer.x, y2: pointer.y });
        break;
      case 'polygon':
        // Basic rectangle-like polygon for simplicity
        const polygon = currentObject.current as fabric.Polygon;
        if (polygon.points && polygon.points.length >= 2) {
          // Update the second point (and others if needed)
          const points = [
            polygon.points[0],
            { x: pointer.x, y: polygon.points[0].y },
            { x: pointer.x, y: pointer.y },
            { x: polygon.points[0].x, y: pointer.y }
          ];
          polygon.set({ points });
        }
        break;
      case 'pan':
        // Implement panning logic - safely handle both Event and fabric.TPointerEvent
        let deltaX = 0, deltaY = 0;
        
        if (options.e instanceof MouseEvent) {
          deltaX = options.e.movementX;
          deltaY = options.e.movementY;
        } else if ('movementX' in options.e && 'movementY' in options.e) {
          // Handle TPointerEvent-like objects that have movementX/Y
          deltaX = (options.e as any).movementX;
          deltaY = (options.e as any).movementY;
        }
        
        if (deltaX !== 0 || deltaY !== 0) {
          const delta = new fabric.Point(deltaX, deltaY);
          fabricCanvas.relativePan(delta);
        }
        break;
    }

    // Ensure rendering happens after object changes
    fabricCanvas.requestRenderAll();
  }, [currentTool, fabricCanvas]);

  const handleMouseUp = useCallback(() => {
    if (!fabricCanvas) return;

    isDrawing.current = false;

    if (currentTool === 'pan') {
      fabricCanvas.defaultCursor = 'grab';
    }

    // Notify parent components that canvas has been updated
    if (currentObject.current) {
      console.log('Object completed:', currentObject.current);
      
      // Ensure the object is properly added to the canvas
      if (!fabricCanvas.contains(currentObject.current)) {
        console.log('Adding object to canvas as it was not properly added');
        fabricCanvas.add(currentObject.current);
      }
      
      // Force a render to ensure the object appears
      fabricCanvas.requestRenderAll();
      
      // Notify parent of the update
      onCanvasUpdated();
    }

    currentObject.current = null;
  }, [currentTool, fabricCanvas, onCanvasUpdated]);

  const handleSelection = useCallback((options: FabricEvent) => {
    if (!fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    onObjectSelected(activeObject || null);
    
    // Log selected object for debugging
    console.log('Object selected:', activeObject);
  }, [fabricCanvas, onObjectSelected]);

  // Setup event handlers
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Reset selection mode based on current tool
    fabricCanvas.selection = currentTool === 'select';
    
    // Setup event handlers
    const handleMouseDownTyped = (options: any) => handleMouseDown(options as FabricEvent);
    const handleMouseMoveTyped = (options: any) => handleMouseMove(options as FabricEvent);
    const handleMouseUpTyped = () => handleMouseUp();
    const handleSelectionCreatedTyped = (options: any) => handleSelection(options as FabricEvent);
    const handleSelectionUpdatedTyped = (options: any) => handleSelection(options as FabricEvent);
    const handleSelectionClearedTyped = () => onObjectSelected(null);
    
    fabricCanvas.on('mouse:down', handleMouseDownTyped);
    fabricCanvas.on('mouse:move', handleMouseMoveTyped);
    fabricCanvas.on('mouse:up', handleMouseUpTyped);
    fabricCanvas.on('selection:created', handleSelectionCreatedTyped);
    fabricCanvas.on('selection:updated', handleSelectionUpdatedTyped);
    fabricCanvas.on('selection:cleared', handleSelectionClearedTyped);
    
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDownTyped);
      fabricCanvas.off('mouse:move', handleMouseMoveTyped);
      fabricCanvas.off('mouse:up', handleMouseUpTyped);
      fabricCanvas.off('selection:created', handleSelectionCreatedTyped);
      fabricCanvas.off('selection:updated', handleSelectionUpdatedTyped);
      fabricCanvas.off('selection:cleared', handleSelectionClearedTyped);
    };
  }, [
    currentTool, 
    fabricCanvas, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleSelection, 
    onObjectSelected, 
    updateCursor
  ]);

  const addGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Create grid lines
    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, height], {
        stroke: '#ebebeb',
        selectable: false,
        evented: false,
      }));
    }

    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(new fabric.Line([0, i * gridSize, width, i * gridSize], {
        stroke: '#ebebeb',
        selectable: false,
        evented: false,
      }));
    }
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  );
};

export default Canvas; 