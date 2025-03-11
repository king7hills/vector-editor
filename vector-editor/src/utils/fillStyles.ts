import * as fabric from 'fabric';

export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  offset: number;  // 0 to 1
  color: string;
}

export interface GradientOptions {
  type: GradientType;
  stops: GradientStop[];
  coords?: {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    r1?: number;
    r2?: number;
  };
}

/**
 * Creates a linear gradient fill for a fabric.js object
 */
export const createLinearGradient = (
  object: fabric.Object, 
  color1: string, 
  color2: string, 
  angle: number = 0
): fabric.Gradient<fabric.Object> => {
  // Convert angle to radians
  const angleRad = angle * Math.PI / 180;
  
  // Calculate gradient coordinates based on angle
  const x1 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50);
  const y1 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50);
  const x2 = Math.round(50 + Math.sin(angleRad) * 50);
  const y2 = Math.round(50 + Math.cos(angleRad) * 50);
  
  return new fabric.Gradient<fabric.Object>({
    type: 'linear',
    coords: {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    },
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 }
    ]
  });
};

/**
 * Creates a radial gradient fill for a fabric.js object
 */
export const createRadialGradient = (
  object: fabric.Object, 
  color1: string, 
  color2: string, 
  radius: number = 50
): fabric.Gradient<fabric.Object, 'radial'> => {
  return new fabric.Gradient<fabric.Object, 'radial'>({
    type: 'radial',
    coords: {
      x1: 50,
      y1: 50,
      x2: 50,
      y2: 50,
      r1: 0,
      r2: radius
    },
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 }
    ]
  });
};

/**
 * Creates a complex gradient with multiple stops
 */
export const createComplexGradient = (options: GradientOptions): fabric.Gradient<fabric.Object> => {
  const defaultCoords = options.type === 'linear' 
    ? { x1: 0, y1: 0, x2: 100, y2: 0 } 
    : { x1: 50, y1: 50, x2: 50, y2: 50, r1: 0, r2: 50 };
  
  // Use type assertion to handle both gradient types
  const gradient = new fabric.Gradient({
    type: options.type,
    coords: { ...defaultCoords, ...options.coords } as any,
    colorStops: options.stops.map(stop => ({
      offset: stop.offset,
      color: stop.color
    }))
  });
  
  return gradient as fabric.Gradient<fabric.Object>;
};

/**
 * Creates a pattern fill from an image
 */
export const createPatternFromImage = (
  imageUrl: string,
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'repeat'
): Promise<fabric.Pattern> => {
  return new Promise((resolve, reject) => {
    // Use the correct loadImage function signature
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const pattern = new fabric.Pattern({
        source: img,
        repeat: repeat
      });
      resolve(pattern);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load pattern image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Creates a pattern fill from a fabric.js canvas
 */
export const createPatternFromCanvas = (
  patternCanvas: fabric.Canvas,
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'repeat',
  scale: number = 1
): fabric.Pattern => {
  // Convert the pattern canvas to a data URL
  const dataURL = patternCanvas.toDataURL({
    format: 'png',
    multiplier: scale
  });
  
  // Create an image element from the data URL
  const img = new Image();
  img.src = dataURL;
  
  // Create a pattern
  return new fabric.Pattern({
    source: img,
    repeat: repeat
  });
};

/**
 * Apply a fill to a fabric.js object
 */
export const applyFillToObject = (
  object: fabric.Object,
  fill: string | fabric.Pattern | fabric.Gradient<fabric.Object>
): void => {
  object.set('fill', fill);
  
  // If it's a gradient, we need to handle the originX and originY
  if (fill instanceof fabric.Gradient) {
    // Make sure gradient coordinates are relative to object dimensions
    object.set({
      originX: 'center',
      originY: 'center'
    });
  }
  
  // Refresh the canvas
  if (object.canvas) {
    object.canvas.renderAll();
  }
}; 