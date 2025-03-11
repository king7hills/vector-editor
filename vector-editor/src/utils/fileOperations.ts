import { saveAs } from 'file-saver';
import * as fabric from 'fabric';
import { FileFormat } from '../types';

/**
 * Export canvas content to the specified file format
 */
export const exportToFormat = (canvas: fabric.Canvas, format: FileFormat, filename: string): void => {
  switch (format) {
    case 'svg':
      exportToSVG(canvas, filename);
      break;
    case 'pdf':
      exportToPDF(canvas, filename);
      break;
    case 'eps':
      exportToEPS(canvas, filename);
      break;
    case 'ai':
      exportToAI(canvas, filename);
      break;
    case 'json':
      exportToJSON(canvas, filename);
      break;
    default:
      console.error('Unsupported format:', format);
  }
};

/**
 * Export canvas content to SVG format
 */
const exportToSVG = (canvas: fabric.Canvas, filename: string): void => {
  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  saveAs(blob, `${filename}.svg`);
};

/**
 * Export canvas content to JSON format
 */
const exportToJSON = (canvas: fabric.Canvas, filename: string): void => {
  const json = JSON.stringify(canvas.toJSON());
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

/**
 * Export canvas content to PDF format
 * Note: This is a simplified implementation. For production, consider using a library like jsPDF.
 */
const exportToPDF = (canvas: fabric.Canvas, filename: string): void => {
  // In a real implementation, we would use a library like jsPDF
  // For now, we'll just alert the user that this feature is coming soon
  alert('PDF export coming soon. For now, try SVG format.');
  
  // Placeholder for PDF export code
  // const pdf = new jsPDF();
  // pdf.addSVG(canvas.toSVG(), 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
  // pdf.save(`${filename}.pdf`);
};

/**
 * Export canvas content to EPS format
 * Note: This is a simplified implementation and would require additional libraries in a real app
 */
const exportToEPS = (canvas: fabric.Canvas, filename: string): void => {
  alert('EPS export coming soon. For now, try SVG format.');
  // Placeholder for EPS export implementation
};

/**
 * Export canvas content to AI format
 * Note: This is a simplified implementation and would require additional libraries in a real app
 */
const exportToAI = (canvas: fabric.Canvas, filename: string): void => {
  alert('AI export coming soon. For now, try SVG format.');
  // Placeholder for AI export implementation
};

/**
 * Import a file and load its content into the canvas
 */
export const importFile = (file: File, canvas: fabric.Canvas): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      
      try {
        if (file.name.toLowerCase().endsWith('.svg')) {
          fabric.loadSVGFromString(fileContent, (objects, options) => {
            try {
              // Convert objects to the expected type for groupSVGElements
              const fabricObjects = objects as unknown as fabric.Object[];
              
              // If no objects were found in the SVG
              if (fabricObjects.length === 0) {
                reject(new Error('No valid elements found in the SVG file.'));
                return;
              }
              
              const loadedObjects = fabric.util.groupSVGElements(fabricObjects, options);
              
              // Center the imported objects on the canvas
              loadedObjects.set({
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center'
              });
              
              // Clear the canvas and add the new objects
              canvas.clear();
              canvas.add(loadedObjects);
              canvas.setActiveObject(loadedObjects);
              canvas.renderAll();
              
              resolve();
            } catch (groupError) {
              console.error('Error grouping SVG elements:', groupError);
              reject(new Error('Error processing the SVG file.'));
            }
          });
        } else if (file.name.toLowerCase().endsWith('.json')) {
          // Handle JSON import
          try {
            const jsonData = JSON.parse(fileContent);
            canvas.clear();
            
            // Load the JSON data into the canvas
            canvas.loadFromJSON(jsonData, () => {
              canvas.renderAll();
              resolve();
            });
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            reject(new Error('Invalid JSON file format.'));
          }
        } else {
          reject(new Error('Unsupported file format. Please use SVG or JSON files.'));
        }
      } catch (error) {
        console.error('Error importing file:', error);
        reject(new Error('Error importing the file. Please check the file format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading the file.'));
    };
    
    if (file.name.toLowerCase().endsWith('.svg') || file.name.toLowerCase().endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reject(new Error('Unsupported file format. Please use SVG or JSON files.'));
    }
  });
}; 