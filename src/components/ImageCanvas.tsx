import { useRef, useEffect, useState } from "react";
import type { BoundingBox } from "../utils/API";

interface ImageCanvasProps {
  imageURL: string;
  onAnnotation: (annotation: BoundingBox | null) => void;
}

interface Coordinates {
  startX: number | null;
  startY: number | null;
  currentX: number | null;
  currentY: number | null;
}

const PADDING = 100;
const SIZE = 700;

// Helper function to resize the image for bounding box submission
const getResizedWidthAndHeight = (width: number, height: number) => {
  const widthLargest = width > height;

  const ratio = Math.max(width, height) / (SIZE - 2 * PADDING);

  return {
    width: widthLargest ? SIZE - 2 * PADDING : width / ratio,
    height: widthLargest ? height / ratio : SIZE - 2 * PADDING,
    ratio
  }
};

const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageURL, onAnnotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [{ startX, startY, currentX, currentY}, setCoordinates] = useState<Coordinates>({
    startX: null,
    startY: null,
    currentX: null,
    currentY: null
  });
  const [drawing, setDrawing] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<BoundingBox[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageURL) {
      const img = new Image();
      img.src = imageURL;

      const { width, height } = getResizedWidthAndHeight(img.width, img.height);
      
      img.onload = () => {
        ctx.drawImage(img, (SIZE - width) /2 , (SIZE - height) /2, width, height);
        // Save image to ref to avoid having to load it again
        imageRef.current = img;
      };
  
      img.onerror = () => {
        console.error("Failed to load image.");
      };
  
    } else {
      imageRef.current = null;
    }
    setAnnotations([]);
  }, [imageURL]); // Every time a new imageURL is loaded (or removed) restart the canvas

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Set initial coordinates when the user holds the mouse down
    setCoordinates({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: null,
      currentY: null
    })
    // Toggle the drawing flag
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // As the mouse moves (while being held down) update the coordinates
    setCoordinates({
      startX,
      startY,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    })
    // Redraw the canvas to show the intented annotation
    redrawCanvas();
  };

  const handleMouseUp = () => {
    if (!drawing) return;

    // Turn off the drawing flag when the mouse is released
    setDrawing(false);

    // If any of the coordinates is missing don't do anything
    if (currentX === null || currentY === null || startX === null || startY === null) return;

    const width = currentX - startX;
    const height = currentY - startY;

    const img = imageRef.current;
  
    // Check that at least one of the dimensions is more than 0
    if (img && (width !== 0 || height !== 0)) {
      // Get the resized image sizes
      const { width: imgWidth, height: imgHeight, ratio } = getResizedWidthAndHeight(img.width, img.height);
      // We'll use the padding to clip any annotations that go out of bounds, and to assign the correct coordinates in the actual image
      const paddingX = (SIZE - imgWidth) /2;
      const paddingY = (SIZE - imgHeight) /2;
      // Remove the padding so the coordinates align with the image and not the canvas. Keep in mind the width/height may be negative if the user went from right to left/up to down
      const topLeftX = width >= 0 ? (startX - paddingX) : (startX + width - paddingX);
      const topLeftY = height >= 0 ? (startY - paddingY) : (startY + height - paddingY);
      // Update the width and height accordingly, removing the out of bounds width/height
      const newWidth = Math.abs(width + Math.min(topLeftX, 0) - Math.max(topLeftX + width - imgWidth, 0));
      const newHeight = Math.abs(height + Math.min(topLeftY, 0) - Math.max(topLeftY + height - imgHeight, 0));

      // If the annotation is completely out of bounds reset the annotations
      if (topLeftX > imgWidth || topLeftY > imgHeight || Math.max(topLeftX, 0) + newWidth < 0 || Math.max(topLeftY, 0) + newHeight < 0) {
        return;
      } else {
        // Otherwise, add the annotation scaled up with the corresponding ratio
        setAnnotations([{ topLeftX: Math.max(topLeftX, 0) * ratio, topLeftY: Math.max(topLeftY, 0) * ratio, width: newWidth * ratio, height: newHeight * ratio}]);
      }
    }
  };

  useEffect(() => {
    // When the annotations change, call the callback provided by the parent and finalize the annotation drawing in canvas
    onAnnotation(annotations[0] || null);
    redrawCanvas(true);
  }, [annotations]);

  const redrawCanvas = (finalize: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentX === null || currentY === null || startX === null || startY === null) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Get the image from the ref to avoid having to load it again
    const img = imageRef.current;
    if (img) {
      // Redraw canvas and image
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { width, height, ratio } = getResizedWidthAndHeight(img.width, img.height);
      
      ctx.drawImage(img, (SIZE - width) /2 , (SIZE - height) /2, width, height);

      const paddingX = (SIZE - width) /2;
      const paddingY = (SIZE - height) /2;

      // Draw each annotation (should be just the one), reapplying the ratio and padding accordingly
      annotations.forEach((annotation) => {
        ctx.strokeStyle = "red";
        ctx.strokeRect(annotation.topLeftX / ratio + paddingX, annotation.topLeftY / ratio + paddingY, annotation.width / ratio, annotation.height / ratio);
      });

      // If the finalize flag isn't on, continue drawing the yellow temporary annotation
      if (drawing && !finalize) {
        const width = currentX - startX;
        const height = currentY - startY;
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(startX, startY, width, height);
      } else {
        // If finalized, reset the coordinates
        setCoordinates({
          startX: null,
          startY: null,
          currentX: null,
          currentY: null
        })
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}

export default ImageCanvas;
