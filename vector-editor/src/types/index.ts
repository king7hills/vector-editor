import { Object as FabricObject } from 'fabric/fabric-impl';

export type ToolType = 
  | 'select' 
  | 'rectangle' 
  | 'ellipse' 
  | 'line' 
  | 'path' 
  | 'pencil'
  | 'text' 
  | 'polygon'
  | 'pan';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  objects: FabricObject[];
}

export type FileFormat = 'svg' | 'pdf' | 'eps' | 'ai' | 'json';

export interface EditorState {
  currentTool: ToolType;
  selectedObjects: FabricObject[];
  zoom: number;
  layers: Layer[];
  currentLayer: string | null;
  history: any[]; // For undo/redo functionality
}

export interface PropertyPanelProps {
  selectedObject: FabricObject | null;
  onPropertyChange: (property: string, value: any) => void;
} 