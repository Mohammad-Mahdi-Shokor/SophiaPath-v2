import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Slider,
  Stack,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Crop as CropIcon,
  Gesture as DrawIcon,
  Undo as UndoIcon,
  RotateRight as RotateRightIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  Add as AddIcon
} from '@mui/icons-material';

const COLOR_PALETTE = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#000000', // Black
  '#FFFFFF'  // White
];

export default function ImageEditorModal({ open, onClose, images = [], imageSrc, onSend }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const addMoreInputRef = useRef(null);

  // Editor states
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState('none'); // 'none', 'draw', 'crop'
  const [brushColor, setBrushColor] = useState('#FF3B30');
  const [brushSize, setBrushSize] = useState(6);
  const [history, setHistory] = useState([]); // array of ImageData for undoing actions

  const [imagesList, setImagesList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDiscardConfirm, setOpenDiscardConfirm] = useState(false);

  const handleCloseAttempt = () => {
    if (imagesList && imagesList.length > 0) {
      setOpenDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);

  // Draggable / Resizable Crop State
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragType, setDragType] = useState('none'); // 'none', 'move', 'nw', 'ne', 'se', 'sw'
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartBox, setDragStartBox] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Original image dimensions
  const [imgObj, setImgObj] = useState(null);

  // Load and initialize image onto canvas
  useEffect(() => {
    if (!open) return;

    let initialList = [];
    if (images && images.length > 0) {
      initialList = [...images];
    } else if (imageSrc) {
      initialList = [imageSrc];
    }

    setImagesList(initialList);
    setActiveIndex(0);

    if (initialList.length > 0) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImgObj(img);
        initCanvas(img);
      };
      img.src = initialList[0];
    }

    // Reset editor settings on open
    setZoom(1);
    setMode('none');
    setHistory([]);
    setDragType('none');
  }, [open, images, imageSrc]);

  // Switch image callback
  const handleSwitchImage = (newIndex) => {
    if (newIndex === activeIndex) return;

    // Save current canvas to slot
    if (canvasRef.current && imagesList.length > 0) {
      const currentDataUrl = canvasRef.current.toDataURL('image/png');
      const copy = [...imagesList];
      copy[activeIndex] = currentDataUrl;
      setImagesList(copy);

      // Load new image
      setActiveIndex(newIndex);
      setZoom(1);
      setMode('none');
      setHistory([]);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImgObj(img);
        initCanvas(img);
      };
      img.src = copy[newIndex];
    }
  };

  // Remove image callback
  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    if (imagesList.length <= 1) {
      onClose();
      return;
    }

    const updatedList = imagesList.filter((_, idx) => idx !== indexToRemove);
    setImagesList(updatedList);

    if (activeIndex === indexToRemove) {
      const nextIndex = 0;
      setActiveIndex(nextIndex);
      setZoom(1);
      setMode('none');
      setHistory([]);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImgObj(img);
        initCanvas(img);
      };
      img.src = updatedList[nextIndex];
    } else if (activeIndex > indexToRemove) {
      setActiveIndex(prev => prev - 1);
    }
  };

  // Add more images callback
  const handleAddMoreImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(dataUrls => {
      setImagesList(prev => [...prev, ...dataUrls]);
    });
    e.target.value = '';
  };

  // Send action callback
  const handleSendAll = () => {
    let finalImages = [...imagesList];
    if (canvasRef.current && finalImages.length > 0) {
      const currentDataUrl = canvasRef.current.toDataURL('image/png');
      finalImages[activeIndex] = currentDataUrl;
    }
    if (onSend) {
      onSend(finalImages);
    }
    setImagesList([]);
    onClose();
  };

  // Set default crop box size (80% of canvas dimensions centered) when entering crop mode
  useEffect(() => {
    if (mode === 'crop' && canvasRef.current) {
      const canvas = canvasRef.current;
      const w = Math.round(canvas.width * 0.8);
      const h = Math.round(canvas.height * 0.8);
      const x = Math.round((canvas.width - w) / 2);
      const y = Math.round((canvas.height - h) / 2);
      setCropBox({ x, y, w, h });
    }
  }, [mode]);

  // Global mousemove/mouseup listener for smooth cropping and resizing (independent of zoom scale)
  useEffect(() => {
    if (dragType === 'none') return;

    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Adjust coordinate movement by /zoom so dragging tracks the cursor exactly at any zoom level
      const dx = (clientX - dragStartPos.x) / zoom;
      const dy = (clientY - dragStartPos.y) / zoom;

      const canvas = canvasRef.current;
      if (!canvas) return;

      let { x, y, w, h } = dragStartBox;

      if (dragType === 'move') {
        x = Math.max(0, Math.min(canvas.width - w, dragStartBox.x + dx));
        y = Math.max(0, Math.min(canvas.height - h, dragStartBox.y + dy));
      } else if (dragType === 'se') {
        w = Math.max(20, Math.min(canvas.width - x, dragStartBox.w + dx));
        h = Math.max(20, Math.min(canvas.height - y, dragStartBox.h + dy));
      } else if (dragType === 'nw') {
        const targetX = Math.max(0, Math.min(dragStartBox.x + dragStartBox.w - 20, dragStartBox.x + dx));
        const targetY = Math.max(0, Math.min(dragStartBox.y + dragStartBox.h - 20, dragStartBox.y + dy));
        w = dragStartBox.w - (targetX - dragStartBox.x);
        h = dragStartBox.h - (targetY - dragStartBox.y);
        x = targetX;
        y = targetY;
      } else if (dragType === 'ne') {
        const targetY = Math.max(0, Math.min(dragStartBox.y + dragStartBox.h - 20, dragStartBox.y + dy));
        w = Math.max(20, Math.min(canvas.width - x, dragStartBox.w + dx));
        h = dragStartBox.h - (targetY - dragStartBox.y);
        y = targetY;
      } else if (dragType === 'sw') {
        const targetX = Math.max(0, Math.min(dragStartBox.x + dragStartBox.w - 20, dragStartBox.x + dx));
        w = dragStartBox.w - (targetX - dragStartBox.x);
        h = Math.max(20, Math.min(canvas.height - y, dragStartBox.h + dy));
        x = targetX;
      }

      setCropBox({
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h)
      });
    };

    const handleMouseUp = () => {
      setDragType('none');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragType, dragStartPos, dragStartBox, zoom]);

  const initCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale down image dimensions if too large, maintaining ratio
    const maxDim = 800;
    let width = img.width;
    let height = img.height;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Save initial history frame
    const initialData = ctx.getImageData(0, 0, width, height);
    setHistory([initialData]);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, data]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return; // Cannot undo initial state
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prevFrame = newHistory[newHistory.length - 1];

    canvas.width = prevFrame.width;
    canvas.height = prevFrame.height;
    ctx.putImageData(prevFrame, 0, 0);

    // Update crop box size to fit canvas limits if active
    if (mode === 'crop') {
      const w = Math.round(canvas.width * 0.8);
      const h = Math.round(canvas.height * 0.8);
      const x = Math.round((canvas.width - w) / 2);
      const y = Math.round((canvas.height - h) / 2);
      setCropBox({ x, y, w, h });
    }
  };

  // Zooming handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Rotation handler
  const handleRotate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create temp canvas to store rotation
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');

    // Translate to center, rotate, and draw
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((90 * Math.PI) / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    // Resize main canvas and apply rotated image
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);

    saveToHistory();

    // Adjust crop box size to fit new rotated dimensions if crop active
    if (mode === 'crop') {
      const w = Math.round(canvas.width * 0.8);
      const h = Math.round(canvas.height * 0.8);
      const x = Math.round((canvas.width - w) / 2);
      const y = Math.round((canvas.height - h) / 2);
      setCropBox({ x, y, w, h });
    }
  };

  // Get mouse/touch position mapped onto canvas scale (for drawing)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  // Drawing trigger events (only used for sketching)
  const startAction = (e) => {
    if (mode !== 'draw') return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  };

  const performAction = (e) => {
    if (isDrawing && mode === 'draw') {
      const coords = getCanvasCoords(e);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const endAction = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  // Apply crop slice to canvas
  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'crop') return;
    const ctx = canvas.getContext('2d');

    const { x, y, w, h } = cropBox;
    if (w < 10 || h < 10) return; // Ignore tiny crops

    // Create temp canvas to perform slice
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

    // Apply crop back to main canvas
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(tempCanvas, 0, 0);

    setMode('none');
    saveToHistory();
  };

  // Save edits
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const editedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    onSave(editedBase64);
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const editedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    onSend(editedBase64);
  };

  // Drag start initializer for crop handles
  const handleDragStart = (e, type) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDragType(type);
    setDragStartPos({ x: clientX, y: clientY });
    setDragStartBox({ ...cropBox });
  };

  // Render crop box and resize handles
  const renderCropOverlay = () => {
    if (mode !== 'crop') return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return (
      <Box
        onMouseDown={(e) => handleDragStart(e, 'move')}
        onTouchStart={(e) => handleDragStart(e, 'move')}
        sx={{
          position: 'absolute',
          top: cropBox.y,
          left: cropBox.x,
          width: cropBox.w,
          height: cropBox.h,
          border: '2px solid #007AFF',
           // Shaded backdrop
          cursor: 'move',
          zIndex: 5
        }}
      >
        {/* NW Handle */}
        <Box
          onMouseDown={(e) => handleDragStart(e, 'nw')}
          onTouchStart={(e) => handleDragStart(e, 'nw')}
          sx={{
            position: 'absolute',
            top: -6 / zoom,
            left: -6 / zoom,
            width: 12 / zoom,
            height: 12 / zoom,
            bgcolor: '#007AFF',
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 6
          }}
        />
        {/* NE Handle */}
        <Box
          onMouseDown={(e) => handleDragStart(e, 'ne')}
          onTouchStart={(e) => handleDragStart(e, 'ne')}
          sx={{
            position: 'absolute',
            top: -6 / zoom,
            right: -6 / zoom,
            width: 12 / zoom,
            height: 12 / zoom,
            bgcolor: '#007AFF',
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'nesw-resize',
            zIndex: 6
          }}
        />
        {/* SE Handle */}
        <Box
          onMouseDown={(e) => handleDragStart(e, 'se')}
          onTouchStart={(e) => handleDragStart(e, 'se')}
          sx={{
            position: 'absolute',
            bottom: -6 / zoom,
            right: -6 / zoom,
            width: 12 / zoom,
            height: 12 / zoom,
            bgcolor: '#007AFF',
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 6
          }}
        />
        {/* SW Handle */}
        <Box
          onMouseDown={(e) => handleDragStart(e, 'sw')}
          onTouchStart={(e) => handleDragStart(e, 'sw')}
          sx={{
            position: 'absolute',
            bottom: -6 / zoom,
            left: -6 / zoom,
            width: 12 / zoom,
            height: 12 / zoom,
            bgcolor: '#007AFF',
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'nesw-resize',
            zIndex: 6
          }}
        />
      </Box>
    );
  };

  return (
    <>
      <Dialog
      open={open}
      onClose={handleCloseAttempt}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          
          position: 'relative'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 7, p: 2 }}>
        <IconButton 
          onClick={handleCloseAttempt} 
          size="small"
          sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Image Editor</Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: '#121212', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px' }}>
        
        {/* Editor Toolbar */}
        <Box sx={{ width: '100%', bgcolor: 'background.paper', p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', borderBottom: '1px solid divider', zIndex: 10 }}>
          <Stack direction="row" spacing={0.5} sx={{ borderRight: '1px solid divider', pr: 1.5 }}>
            <Tooltip title="Zoom In"><IconButton onClick={handleZoomIn} size="small"><ZoomInIcon /></IconButton></Tooltip>
            <Tooltip title="Zoom Out"><IconButton onClick={handleZoomOut} size="small"><ZoomOutIcon /></IconButton></Tooltip>
            <Tooltip title="Reset Zoom"><IconButton onClick={handleZoomReset} size="small"><ResetIcon /></IconButton></Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Draw Mode">
              <Button
                variant={mode === 'draw' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<DrawIcon />}
                onClick={() => setMode(mode === 'draw' ? 'none' : 'draw')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Draw
              </Button>
            </Tooltip>

            <Tooltip title="Crop Mode">
              <Button
                variant={mode === 'crop' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<CropIcon />}
                onClick={() => setMode(mode === 'crop' ? 'none' : 'crop')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Crop
              </Button>
            </Tooltip>
          </Stack>

          {mode === 'crop' && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={applyCrop}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Confirm Crop
            </Button>
          )}

          <Stack direction="row" spacing={0.5} sx={{ borderRight: '1px solid divider', pr: 1.5 }}>
            <Tooltip title="Rotate 90°"><IconButton onClick={handleRotate} size="small"><RotateRightIcon /></IconButton></Tooltip>
            <Tooltip title="Undo"><IconButton onClick={handleUndo} disabled={history.length <= 1} size="small"><UndoIcon /></IconButton></Tooltip>
          </Stack>
        </Box>

        {/* Dynamic options based on toolbar mode selection */}
        {mode === 'draw' && (
          <Box sx={{ width: '100%', bgcolor: 'background.paper', px: 3, py: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid divider' }}>
            <Stack direction="row" spacing={0.5}>
              {COLOR_PALETTE.map((c) => (
                <IconButton
                  key={c}
                  onClick={() => setBrushColor(c)}
                  sx={{
                    width: 22,
                    height: 22,
                    bgcolor: c,
                    border: brushColor === c ? '2px solid var(--primary-main, #3D5CFF)' : '1px solid rgba(0,0,0,0.1)',
                    
                    '&:hover': { bgcolor: c, opacity: 0.8 }
                  }}
                />
              ))}
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 200 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>Size:</Typography>
              <Slider
                value={brushSize}
                min={2}
                max={20}
                onChange={(e, val) => setBrushSize(val)}
                size="small"
              />
              <Typography variant="caption" sx={{ width: 15 }}>{brushSize}</Typography>
            </Box>
          </Box>
        )}

        {/* Canvas Workspace wrapper */}
        <Box 
          ref={wrapperRef}
          sx={{
            flexGrow: 1,
            width: '100%',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            position: 'relative',
            maxHeight: 'calc(80vh - 180px)'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              
              display: 'inline-block'
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                cursor: mode === 'draw' ? 'crosshair' : mode === 'crop' ? 'default' : 'default',
                touchAction: 'none'
              }}
              onMouseDown={startAction}
              onMouseMove={performAction}
              onMouseUp={endAction}
              onMouseLeave={endAction}
              onTouchStart={startAction}
              onTouchMove={performAction}
              onTouchEnd={endAction}
            />
            {renderCropOverlay()}
          </Box>
        </Box>
      </DialogContent>

      {/* BOTTOM IMAGE ROW SELECTOR & ACTION BUTTONS */}
      <Box sx={{ p: 2, borderTop: '1px solid var(--divider)', bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, alignItems: 'center' }}>
          {imagesList.map((imgSrc, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--primary-color)' : '1px solid var(--divider)',
                  
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <img 
                  src={imgSrc} 
                  alt={`Preview ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onClick={() => handleSwitchImage(idx)}
                />
                
                {/* Delete button (small cross overlay) */}
                <IconButton
                  size="small"
                  onClick={(e) => handleRemoveImage(idx, e)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    p: 0,
                    fontSize: '10px',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.9)' }
                  }}
                >
                  ✕
                </IconButton>
              </Box>
            );
          })}
          
          {/* Add More Button */}
          <Box
            onClick={() => addMoreInputRef.current?.click()}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1.5,
              border: '2px dashed var(--divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }
            }}
          >
            <AddIcon />
            <input type="file" multiple ref={addMoreInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAddMoreImages} />
          </Box>
        </Stack>
      </Box>

      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={handleCloseAttempt}
          sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendAll}
          sx={{ textTransform: 'none', px: 4, borderRadius: 2, fontWeight: 700 }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>

    {/* Discard Confirmation Dialog */}
    <Dialog
      open={openDiscardConfirm}
      onClose={() => setOpenDiscardConfirm(false)}
      PaperProps={{ sx: { borderRadius: 2.5, p: 1, maxWidth: 340 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Discard changes?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Are you sure you want to discard your selected image/s? Any changes will be lost.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        <Button 
          variant="outlined" 
          onClick={() => setOpenDiscardConfirm(false)}
          fullWidth
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="error"
          onClick={() => {
            setOpenDiscardConfirm(false);
            onClose();
          }}
          fullWidth
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  </>
);
}
