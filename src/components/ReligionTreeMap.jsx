import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Chip,
  Breadcrumbs,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Calendar,
  Users,
  Compass,
  Globe,
  Clock,
  RotateCcw,
  User,
  ExternalLink,
  GitFork,
  Orbit,
  ArrowRight,
  Maximize,
  Minimize,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import religion tree data
import religionsData from '../data/religionsData.json';

// Helper: Traverse tree to find all node IDs
const getAllNodeIds = (node, ids = []) => {
  ids.push(node.id);
  if (node.children) {
    node.children.forEach(child => getAllNodeIds(child, ids));
  }
  return ids;
};

// Helper: Traverse tree to find a node by ID and build the breadcrumb path
const findNodeAndPath = (node, targetId, path = []) => {
  const currentPath = [...path, { id: node.id, name: node.name, symbol: node.symbol }];
  if (node.id === targetId) {
    return { node, path: currentPath };
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findNodeAndPath(child, targetId, currentPath);
      if (result) return result;
    }
  }
  return null;
};

// Helper: Find all node IDs matching direct search query (only direct titles or symbols)
const findMatchingNodeIds = (node, query, matches = []) => {
  if (!query) return matches;
  const q = query.toLowerCase().trim();
  
  const textMatches = 
    node.name.toLowerCase().includes(q) ||
    node.symbol.toLowerCase().includes(q);

  if (textMatches) {
    matches.push(node.id);
  }

  if (node.children) {
    node.children.forEach(child => findMatchingNodeIds(child, query, matches));
  }
  return matches;
};

// Helper: Find all ancestor IDs for a list of node IDs to auto-expand them
const findAncestors = (node, targetIds, currentAncestors = [], allAncestors = new Set()) => {
  if (targetIds.includes(node.id)) {
    currentAncestors.forEach(id => allAncestors.add(id));
  }
  if (node.children) {
    node.children.forEach(child => {
      findAncestors(child, targetIds, [...currentAncestors, node.id], allAncestors);
    });
  }
  return allAncestors;
};

// Helper: Recursively count visible leaf descendants for leaf-proportional angular distribution
const countVisibleLeaves = (node, expandedNodes) => {
  const isExpanded = !!expandedNodes[node.id];
  const hasChildren = node.children && node.children.length > 0;
  
  if (!hasChildren || !isExpanded) {
    return 1;
  }
  return node.children.reduce((acc, child) => acc + countVisibleLeaves(child, expandedNodes), 0);
};

// Dynamic node size based on depth
const clampPan = (x, y, layoutMode) => {
  if (layoutMode === 'vertical') {
    return {
      x: Math.min(Math.max(x, -3000), 3000),
      y: Math.min(Math.max(y, -1000), 2500)
    };
  } else {
    return {
      x: Math.min(Math.max(x, -3000), 3000),
      y: Math.min(Math.max(y, -3000), 3000)
    };
  }
};

// Helper: Resolve dynamic node size and font specs based on depth (dramatically contrasted)
const getNodeSizeConfig = (depth) => {
  if (depth === 0) {
    return { size: 94, font: '2.2rem', labelFont: '0.84rem', labelWeight: 950, iconOffset: 47 };
  }
  if (depth === 1) {
    return { size: 72, font: '1.7rem', labelFont: '0.74rem', labelWeight: 850, iconOffset: 36 };
  }
  if (depth === 2) {
    return { size: 50, font: '1.2rem', labelFont: '0.62rem', labelWeight: 750, iconOffset: 25 };
  }
  // Leaves are kept compact to maximize separation space and prevent overlap
  return { size: 32, font: '0.85rem', labelFont: '0.52rem', labelWeight: 600, iconOffset: 16 };
};


// MATHEMATICAL LAYOUT GENERATOR
const computeGraphLayout = (root, expandedNodes, layoutMode) => {
  const visibleNodes = [];
  const links = [];
  
  // Pass 1: Count visible leaf nodes to allocate horizontal spacing in Vertical mode
  let leafCount = 0;
  const countLeaves = (node) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    if (!hasChildren || !isExpanded) {
      node.visibleLeafIndex = leafCount;
      leafCount++;
    } else {
      node.children.forEach(countLeaves);
    }
  };
  countLeaves(root);

  // Pass 2: Calculate Coordinates
  
  // 2a. Vertical layout: Parent is centered above children; leaves are aligned linearly
  const layoutVertical = (node, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    // Y-coordinate determined by depth
    const y = depth * 190;
    let x = 0;
    
    if (!hasChildren || !isExpanded) {
      // Leaf node spacing: 270px to avoid text overlap
      x = node.visibleLeafIndex * 270 - ((leafCount - 1) * 270) / 2;
    } else {
      // Recursively layout children
      node.children.forEach(child => layoutVertical(child, depth + 1));
      
      // Parent is positioned at the midpoint of its outer children
      const firstChildX = node.children[0].x;
      const lastChildX = node.children[node.children.length - 1].x;
      x = (firstChildX + lastChildX) / 2;
    }
    
    node.x = x;
    node.y = y;
    
    const sizeConfig = getNodeSizeConfig(depth);
    visibleNodes.push({
      id: node.id,
      name: node.name,
      symbol: node.symbol,
      family: node.family,
      summary: node.summary,
      foundingPeriod: node.foundingPeriod,
      founders: node.founders,
      geographicOrigin: node.geographicOrigin,
      followersEstimate: node.followersEstimate,
      scriptures: node.scriptures,
      branches: node.branches,
      coreBeliefs: node.coreBeliefs,
      historicalBackground: node.historicalBackground,
      practices: node.practices,
      holidays: node.holidays,
      languages: node.languages,
      relatedReligions: node.relatedReligions,
      timelinePlacement: node.timelinePlacement,
      layoutX: x,
      layoutY: y,
      depth,
      hasChildren,
      isExpanded,
      size: sizeConfig.size,
      font: sizeConfig.font,
      labelFont: sizeConfig.labelFont,
      labelWeight: sizeConfig.labelWeight,
      iconOffset: sizeConfig.iconOffset
    });
  };

  // 2b. Radial layout: Children split parent's sector proportionally based on descendant leaf count
  const layoutRadial = (node, depth = 0, thetaStart = 0, thetaEnd = 2 * Math.PI, idx = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    // Polar coordinates: Radius (r) and Angle (theta)
    // Alternate radii (70px stagger) and expanded radial ring size (350px) to prevent node overlaps in crowded rings
    const radialStagger = depth > 0 ? (idx % 3) * 70 : 0;
    const r = (depth * 350) + radialStagger;
    
    // Apply a micro-angular stagger to alternate sibling nodes left/right of the sector center
    const angularStagger = depth > 1 ? ((idx % 2 === 0 ? 1 : -1) * 0.015) : 0;
    const theta = ((thetaStart + thetaEnd) / 2) + angularStagger;
    
    // Convert to Cartesian (x, y)
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    
    node.x = x;
    node.y = y;
    
    const sizeConfig = getNodeSizeConfig(depth);
    visibleNodes.push({
      id: node.id,
      name: node.name,
      symbol: node.symbol,
      family: node.family,
      summary: node.summary,
      foundingPeriod: node.foundingPeriod,
      founders: node.founders,
      geographicOrigin: node.geographicOrigin,
      followersEstimate: node.followersEstimate,
      scriptures: node.scriptures,
      branches: node.branches,
      coreBeliefs: node.coreBeliefs,
      historicalBackground: node.historicalBackground,
      practices: node.practices,
      holidays: node.holidays,
      languages: node.languages,
      relatedReligions: node.relatedReligions,
      timelinePlacement: node.timelinePlacement,
      layoutX: x,
      layoutY: y,
      depth,
      hasChildren,
      isExpanded,
      theta,
      r,
      size: sizeConfig.size,
      font: sizeConfig.font,
      labelFont: sizeConfig.labelFont,
      labelWeight: sizeConfig.labelWeight,
      iconOffset: sizeConfig.iconOffset
    });
    
    if (hasChildren && isExpanded) {
      // Leaf-proportional angular distribution math
      const totalLeaves = countVisibleLeaves(node, expandedNodes);
      let currentTheta = thetaStart;
      
      node.children.forEach((child, childIdx) => {
        const childLeaves = countVisibleLeaves(child, expandedNodes);
        const childSector = (thetaEnd - thetaStart) * (childLeaves / totalLeaves);
        
        layoutRadial(
          child,
          depth + 1,
          currentTheta,
          currentTheta + childSector,
          childIdx
        );
        currentTheta += childSector;
      });
    }
  };

  // Run selected layout solver
  if (layoutMode === 'vertical') {
    layoutVertical(root, 0);
  } else {
    layoutRadial(root, 0, 0.05 * Math.PI, 1.95 * Math.PI, 0); 
  }

  // Pass 3: Construct Connecting Link Paths with dynamic source/target radius offsets
  const buildLinks = (node) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    
    if (hasChildren && isExpanded) {
      node.children.forEach(child => {
        const sourceConfig = getNodeSizeConfig(node.depth);
        const targetConfig = getNodeSizeConfig(child.depth);
        
        links.push({
          id: `${node.id}-${child.id}`,
          sourceX: node.x,
          sourceY: node.y,
          sourceOffset: sourceConfig.iconOffset,
          targetX: child.x,
          targetY: child.y,
          targetOffset: targetConfig.iconOffset,
          family: child.family
        });
        buildLinks(child);
      });
    }
  };
  buildLinks(root);

  return { visibleNodes, links };
};

export const ReligionTreeMap = () => {
  // Navigation & Dialog States
  const [selectedNodeId, setSelectedNodeId] = useState('religions_root');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeDialogNode, setActiveDialogNode] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Layout and Fullscreen modes
  const [layoutMode, setLayoutMode] = useState('vertical');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Expanded Nodes state (default root and major families expanded)
  const [expandedNodes, setExpandedNodes] = useState({
    'religions_root': true,
    'abrahamic': true,
    'dharmic': true,
    'east_asian': true,
    'secular': true
  });

  // Zoom and Pan camera state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null); // Reference to the outer container for fullscreen portalling

  // Create mutable refs of scale, pan, and layoutMode states to safely reference inside non-updating wheel listener
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  const layoutModeRef = useRef(layoutMode);
  const dialogOpenRef = useRef(dialogOpen);

  useEffect(() => {
    scaleRef.current = scale;
    panRef.current = pan;
    layoutModeRef.current = layoutMode;
    dialogOpenRef.current = dialogOpen;
  }, [scale, pan, layoutMode, dialogOpen]);

  // All node list for searching
  const allNodeIds = useMemo(() => getAllNodeIds(religionsData), []);

  // Compute matching search results (only direct names or symbols)
  const matchingNodeIds = useMemo(() => {
    return findMatchingNodeIds(religionsData, searchQuery);
  }, [searchQuery]);

  // Auto-expand path to search matches
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const ancestorsToExpand = findAncestors(religionsData, matchingNodeIds);
      setExpandedNodes(prev => {
        const next = { ...prev };
        ancestorsToExpand.forEach(id => {
          next[id] = true;
        });
        return next;
      });
    }
  }, [searchQuery, matchingNodeIds]);

  // Sync state with HTML5 Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Pointer-anchored scroll wheel zoom listener
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e) => {
      if (dialogOpenRef.current) return; // Freeze interactions when dialog is open
      e.preventDefault(); 

      const zoomIntensity = 0.08;
      const delta = e.deltaY < 0 ? 1 : -1;
      
      const currentScale = scaleRef.current;
      const nextScale = Math.min(Math.max(currentScale + delta * zoomIntensity, 0.45), 1.7);
      
      // Calculate mouse pointer relative to the translation origin of the container
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = layoutModeRef.current === 'vertical' ? 50 : rect.height / 2;
      const mouseX = e.clientX - rect.left - centerX;
      const mouseY = e.clientY - rect.top - centerY;
      
      // Adjust pan coordinates to zoom towards the pointer
      setPan(prev => clampPan(
        prev.x + (mouseX - prev.x) * (1 - nextScale / currentScale),
        prev.y + (mouseY - prev.y) * (1 - nextScale / currentScale),
        layoutModeRef.current
      ));
      setScale(nextScale);
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, []);


  // Trigger brief fade-out of connections during layout shifts
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 750);
    return () => clearTimeout(timer);
  }, [layoutMode, expandedNodes]);

  // Compute absolute coordinate mapping
  const { visibleNodes, links } = useMemo(() => {
    return computeGraphLayout(religionsData, expandedNodes, layoutMode);
  }, [expandedNodes, layoutMode]);

  // Active path breadcrumb data
  const activePath = useMemo(() => {
    const result = findNodeAndPath(religionsData, selectedNodeId);
    return result ? result.path : [];
  }, [selectedNodeId]);

  // Expand / Collapse all
  const handleExpandAll = () => {
    const next = {};
    allNodeIds.forEach(id => {
      next[id] = true;
    });
    setExpandedNodes(next);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({ 'religions_root': true });
  };

  const handleToggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Centered zoom controls (disabled if dialog is open)
  const handleZoomIn = () => {
    if (dialogOpen) return;
    const nextScale = Math.min(scale + 0.15, 1.7);
    setPan(prev => clampPan(
      prev.x * (nextScale / scale),
      prev.y * (nextScale / scale),
      layoutMode
    ));
    setScale(nextScale);
  };

  const handleZoomOut = () => {
    if (dialogOpen) return;
    const nextScale = Math.max(scale - 0.15, 0.45);
    setPan(prev => clampPan(
      prev.x * (nextScale / scale),
      prev.y * (nextScale / scale),
      layoutMode
    ));
    setScale(nextScale);
  };

  const handleZoomReset = () => {
    if (dialogOpen) return;
    setScale(1);
    setPan(layoutMode === 'vertical' ? { x: 0, y: 50 } : { x: 0, y: 220 });
  };

  // Set initial camera offsets based on layout selection
  useEffect(() => {
    handleZoomReset();
  }, [layoutMode]);

  // Mouse drag panning handlers (disabled if dialog is open)
  const handleMouseDown = (e) => {
    if (dialogOpen || e.button !== 0) return; 
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || dialogOpen) return;
    setPan(clampPan(
      e.clientX - dragStart.x,
      e.clientY - dragStart.y,
      layoutMode
    ));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch gesture panning handlers (disabled if dialog is open)
  const handleTouchStart = (e) => {
    if (dialogOpen || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || dialogOpen || e.touches.length !== 1) return;
    setPan(clampPan(
      e.touches[0].clientX - dragStart.x,
      e.touches[0].clientY - dragStart.y,
      layoutMode
    ));
  };

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (dialogOpen) return; // Disable keyboard navigation on canvas if dialog is open
    const index = visibleNodes.findIndex(n => n.id === selectedNodeId);
    if (index === -1) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % visibleNodes.length;
      setSelectedNodeId(visibleNodes[nextIndex].id);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + visibleNodes.length) % visibleNodes.length;
      setSelectedNodeId(visibleNodes[prevIndex].id);
    } else if (e.key === 'Enter') {
      const activeNode = visibleNodes.find(n => n.id === selectedNodeId);
      if (activeNode) {
        handleNodeInspect(activeNode);
      }
    }
  };

  // Dialog inspection launcher
  const handleNodeInspect = (node, e) => {
    if (e) e.stopPropagation();
    setSelectedNodeId(node.id);
    setActiveDialogNode(node);
    setDialogOpen(true);
  };

  // HTML5 Fullscreen API toggle
  const toggleFullscreen = () => {
    const container = wrapperRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error("Failed to enter fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Color Mapping Styles per Family
  const getFamilyColorStyles = (family) => {
    switch (family) {
      case 'Indigenous':
        return {
          border: '1.5px solid rgba(76, 175, 80, 0.22)',
          badgeColor: '#4caf50',
          lineColor: 'rgba(76, 175, 80, 0.45)'
        };
      case 'Abrahamic':
        return {
          border: '1.5px solid rgba(28, 176, 246, 0.22)',
          badgeColor: 'var(--primary-main)',
          lineColor: 'rgba(28, 176, 246, 0.45)'
        };
      case 'Dharmic':
        return {
          border: '1.5px solid rgba(255, 152, 0, 0.22)',
          badgeColor: '#ff9800',
          lineColor: 'rgba(255, 152, 0, 0.45)'
        };
      case 'East Asian':
        return {
          border: '1.5px solid rgba(0, 150, 136, 0.22)',
          badgeColor: '#009688',
          lineColor: 'rgba(0, 150, 136, 0.45)'
        };
      case 'Iranian':
        return {
          border: '1.5px solid rgba(233, 30, 99, 0.22)',
          badgeColor: '#e91e63',
          lineColor: 'rgba(233, 30, 99, 0.45)'
        };
      case 'Secular':
      case 'Non-Religious':
        return {
          border: '1.5px solid rgba(156, 39, 176, 0.22)',
          badgeColor: '#e040fb',
          lineColor: 'rgba(156, 39, 176, 0.45)'
        };
      case 'Ancient Near East':
      case 'Ancient European':
        return {
          border: '1.5px solid rgba(121, 85, 72, 0.22)',
          badgeColor: '#795548',
          lineColor: 'rgba(121, 85, 72, 0.45)'
        };
      case 'Modern Paganism':
      case 'Esoteric':
        return {
          border: '1.5px solid rgba(255, 235, 59, 0.22)',
          badgeColor: '#ffeb3b',
          lineColor: 'rgba(255, 235, 59, 0.45)'
        };
      case 'New Movements':
        return {
          border: '1.5px solid rgba(3, 169, 244, 0.22)',
          badgeColor: '#03a9f4',
          lineColor: 'rgba(3, 169, 244, 0.45)'
        };
      case 'Root':
      default:
        return {
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          badgeColor: 'var(--text-secondary)',
          lineColor: 'rgba(255, 255, 255, 0.2)'
        };
    }
  };

  // Generate SVG Cubic Bezier Connector Path strings
  const getLinkPathString = (link) => {
    const { sourceX, sourceY, sourceOffset, targetX, targetY, targetOffset } = link;
    
    if (layoutMode === 'vertical') {
      // S-curve connecting top/bottom boundary offsets of dynamically sized circles
      const parentBottomY = sourceY + sourceOffset; 
      const childTopY = targetY - targetOffset;
      const midY = (parentBottomY + childTopY) / 2;
      return `M ${sourceX} ${parentBottomY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${childTopY}`;
    } else {
      // Radial line connecting directly to centers
      const midX = (sourceX + targetX) / 2 * 1.05;
      const midY = (sourceY + targetY) / 2 * 1.05;
      return `M ${sourceX} ${sourceY} Q ${midX} ${midY}, ${targetX} ${targetY}`;
    }
  };

  return (
    <Box 
      ref={wrapperRef}
      className="religion-tree-map-wrapper" 
      style={isFullscreen ? {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        background: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden'
      } : { 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      
      {/* Control panel */}
      <Paper 
        className="glass-panel" 
        style={isFullscreen ? {
          padding: '16px 24px', 
          borderRadius: 0, 
          borderBottom: '1px solid var(--divider)', 
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          background: 'rgba(10,10,15,0.95)', 

          zIndex: 10
        } : {
          padding: '16px 20px', 
          borderRadius: '16px', 
          border: '1px solid var(--divider)', 
          background: 'var(--surface-glass)', 

          zIndex: 1
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search branches or symbols directly..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--divider)' }
                }
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }} style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={layoutMode}
              exclusive
              onChange={(e, val) => val && setLayoutMode(val)}
              aria-label="layout style"
              sx={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--divider)',
                borderRadius: '10px',
                '& .MuiToggleButton-root': {
                  color: 'var(--text-secondary)',
                  border: 'none',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  padding: '6px 14px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  '&.Mui-selected': {
                    color: 'var(--primary-main)',
                    background: 'rgba(28, 176, 246, 0.08)'
                  }
                }
              }}
            >
              <ToggleButton value="vertical">
                <GitFork size={13} /> Vertical Tree
              </ToggleButton>
              <ToggleButton value="radial">
                <Orbit size={13} /> Radial Orbit
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem style={{ backgroundColor: 'var(--divider)', margin: '0 4px' }} />

            <Button
              size="small"
              variant="outlined"
              onClick={handleExpandAll}
              style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 800, color: 'var(--text-primary)', borderColor: 'var(--divider)', fontSize: '0.72rem' }}
            >
              Expand All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleCollapseAll}
              style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 800, color: 'var(--text-primary)', borderColor: 'var(--divider)', fontSize: '0.72rem' }}
            >
              Collapse All
            </Button>

            <Divider orientation="vertical" flexItem style={{ backgroundColor: 'var(--divider)', margin: '0 4px' }} />
            
            <IconButton onClick={handleZoomIn} size="small" style={{ border: '1px solid var(--divider)', borderRadius: '8px', color: 'var(--text-primary)' }} title="Zoom In"><ZoomIn size={16} /></IconButton>
            <IconButton onClick={handleZoomOut} size="small" style={{ border: '1px solid var(--divider)', borderRadius: '8px', color: 'var(--text-primary)' }} title="Zoom Out"><ZoomOut size={16} /></IconButton>
            <IconButton onClick={handleZoomReset} size="small" style={{ border: '1px solid var(--divider)', borderRadius: '8px', color: 'var(--text-primary)' }} title="Reset Viewport"><RotateCcw size={16} /></IconButton>
            
            <Divider orientation="vertical" flexItem style={{ backgroundColor: 'var(--divider)', margin: '0 4px' }} />
            
            <Button
              size="small"
              variant="outlined"
              startIcon={isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              onClick={toggleFullscreen}
              style={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                color: 'var(--primary-main)',
                borderColor: 'rgba(28, 176, 246, 0.3)',
                fontSize: '0.72rem'
              }}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Breadcrumb path tracker */}
      {!isFullscreen && (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { color: 'var(--text-disabled)' } }}>
            {activePath.map((item, idx) => {
              const isLast = idx === activePath.length - 1;
              return (
                <Typography 
                  key={item.id} 
                  variant="caption" 
                  style={{ 
                    fontWeight: isLast ? 900 : 500, 
                    color: isLast ? 'var(--primary-main)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                  onClick={() => setSelectedNodeId(item.id)}
                >
                  {item.symbol} {item.name}
                </Typography>
              );
            })}
          </Breadcrumbs>
          {searchQuery && (
            <Typography variant="caption" style={{ color: '#ffeb3b', fontWeight: 800 }}>
              Found {matchingNodeIds.length} matches
            </Typography>
          )}
        </Box>
      )}

      {/* Main draggable canvas container */}
      <Paper 
        className="glass-panel" 
        style={isFullscreen ? {
          flexGrow: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden', 
          position: 'relative', 
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'rgba(10,10,15,0.4)',

          borderRadius: 0,
          border: 'none'
        } : { 
          height: '640px', 
          overflow: 'hidden', 
          position: 'relative', 
          borderRadius: '24px', 
          border: '1.5px solid var(--divider)',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'rgba(10,10,15,0.4)'}}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
      >
        
        {/* Dynamic canvas element applying drag, pan, zoom transforms */}
        <div
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: layoutMode === 'vertical' ? '50px' : '50%',
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transformOrigin: layoutMode === 'vertical' ? 'top center' : 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            display: 'inline-block',
            width: '1px', 
            height: '1px'
          }}
        >
          {/* SVG vector layer drawing paths under the cards */}
          <svg
            style={{
              position: 'absolute',
              overflow: 'visible',
              width: '1px',
              height: '1px',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              opacity: isTransitioning ? 0 : 0.5,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {links.map(link => {
              const colors = getFamilyColorStyles(link.family);
              return (
                <motion.path
                  key={link.id}
                  d={getLinkPathString(link)}
                  fill="none"
                  stroke={colors.lineColor}
                  strokeWidth={2.2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              );
            })}
          </svg>

          {/* Abstract flat circle nodes positioned absolutely */}
          {visibleNodes.map(node => {
            const isMatch = matchingNodeIds.includes(node.id);
            const isSelected = selectedNodeId === node.id;
            const colors = getFamilyColorStyles(node.family);

            // Hemisphere Check for Radial labels to orient them outwards and prevent text overlapping
            const isRadialUpper = layoutMode === 'radial' && node.layoutY < 0;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate3d(${node.layoutX}px, ${node.layoutY}px, 0)`,
                  transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                  zIndex: isSelected ? 15 : 10
                }}
              >
                <div
                  onClick={(e) => handleNodeInspect(node, e)}
                  style={{
                    display: 'flex',
                    flexDirection: isRadialUpper ? 'column-reverse' : 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {/* Core Circular Orb (Dynamically Sized based on depth) */}
                  <div
                    style={{
                      width: `${node.size}px`,
                      height: `${node.size}px`,
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isMatch 
                        ? '2px solid #ffeb3b' 
                        : (isSelected ? `2px solid var(--primary-main)` : `1.5px solid ${colors.badgeColor}`),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'}}
                  >
                    <Typography style={{ fontSize: node.font, lineHeight: 1, color: isSelected ? 'var(--primary-main)' : 'var(--text-primary)' }}>
                      {node.symbol}
                    </Typography>
                  </div>

                  {/* Text Label (maxWidth and font size scale dynamically, and margin reverses in upper radial hemisphere) */}
                  <Typography
                    style={{
                      marginTop: isRadialUpper ? '0px' : '8px',
                      marginBottom: isRadialUpper ? '8px' : '0px',
                      fontSize: node.labelFont,
                      fontWeight: node.labelWeight,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isMatch ? '#ffeb3b' : (isSelected ? 'var(--primary-main)' : 'var(--text-primary)'),
                      fontFamily: '"Outfit", sans-serif',
                      textAlign: 'center',
                      maxWidth: layoutMode === 'radial' ? `${Math.min(node.size * 2.2, 72)}px` : '130px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      lineHeight: 1.2
                    }}
                  >
                    {node.name}
                  </Typography>

                  {/* Small Era indicator (only shown if space permits - hidden on leaves to prevent clutter) */}
                  {node.depth < 3 && (
                    <Typography
                      style={{
                        fontSize: '0.52rem',
                        color: 'var(--text-secondary)',
                        opacity: 0.65,
                        fontFamily: '"Outfit", sans-serif',
                        marginTop: isRadialUpper ? '0px' : '1px',
                        marginBottom: isRadialUpper ? '1px' : '0px'
                      }}
                    >
                      {node.foundingPeriod}
                    </Typography>
                  )}

                  {/* Minimalist expand/collapse trigger node below */}
                  {node.hasChildren && (
                    <div
                      onClick={(e) => handleToggleExpand(node.id, e)}
                      style={{
                        position: 'absolute',
                        bottom: isRadialUpper ? `-${node.iconOffset - 16}px` : `-${node.iconOffset - 6}px`, // Adjusted for inverse layout
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: node.isExpanded ? 'var(--background-paper)' : colors.badgeColor,
                        border: `1.5px solid ${colors.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: node.isExpanded ? colors.badgeColor : '#fff',
                        fontSize: '0.55rem',
                        fontWeight: 900,
                        zIndex: 25,
                        cursor: 'pointer'}}
                    >
                      {node.isExpanded ? '−' : '+'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions Overlay */}
        <Box style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'none', opacity: 0.55 }}>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={12} /> Drag to Pan | Scroll wheel or floating buttons to Zoom | Click node to inspect details directly
          </Typography>
        </Box>
      </Paper>

      {/* Modern Detailed Research Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        container={() => wrapperRef.current} // Portals the dialog inside the wrapperRef layer to support HTML5 Fullscreen visibility
        PaperProps={{
          style: {
            background: 'var(--background-paper)',
            border: '1px solid var(--divider)',
            borderRadius: '24px',
            color: 'var(--text-primary)',
            padding: '8px',

            position: 'relative'
          }
        }}
      >
        {activeDialogNode && (
          <>
            {/* Top-Right Absolute Close Cross Button */}
            <IconButton
              aria-label="close"
              onClick={() => setDialogOpen(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--divider)',
                zIndex: 20
              }}
            >
              <X size={18} />
            </IconButton>

            <DialogTitle style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 56px 16px 24px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{activeDialogNode.symbol}</span>
                <Box>
                  <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
                    {activeDialogNode.name}
                  </Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                    {activeDialogNode.family} Tradition | {activeDialogNode.geographicOrigin}
                  </Typography>
                </Box>
              </Box>
              <Chip label={activeDialogNode.foundingPeriod} color="primary" size="small" style={{ background: 'var(--hero-gradient)', fontWeight: 800, fontSize: '0.72rem' }} />
            </DialogTitle>

            <DialogContent style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto' }}>
              <Grid container spacing={3}>
                
                {/* Left Column - Core stats and beliefs */}
                <Grid size={{ xs: 12, md: 5 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Meta stats card */}
                  <Paper style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--divider)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} style={{ color: 'var(--primary-main)' }} />
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>
                        Founder / Key Figures: <span style={{ color: 'var(--text-primary)' }}>{activeDialogNode.founders.join(', ')}</span>
                      </Typography>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={16} style={{ color: 'var(--primary-main)' }} />
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>
                        Adherents: <span style={{ color: 'var(--text-primary)' }}>{activeDialogNode.followersEstimate}</span>
                      </Typography>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Globe size={16} style={{ color: 'var(--primary-main)' }} />
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>
                        Socio-Cultural Languages: <span style={{ color: 'var(--text-primary)' }}>{activeDialogNode.languages.join(', ')}</span>
                      </Typography>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Compass size={16} style={{ color: 'var(--primary-main)' }} />
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>
                        Timeline Node: <span style={{ color: 'var(--text-primary)' }}>{activeDialogNode.timelinePlacement}</span>
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Core Beliefs Checklist */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '10px' }}>
                      Core Beliefs & Teachings
                    </Typography>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeDialogNode.coreBeliefs.map((belief, idx) => (
                        <Box key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary-main)', fontSize: '0.9rem', lineHeight: 1 }}>•</span>
                          <Typography variant="body2" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                            {belief}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Core practices and rituals */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '10px' }}>
                      Key Practices & Liturgy
                    </Typography>
                    <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {activeDialogNode.practices.map((practice, idx) => (
                        <Chip key={idx} label={practice} size="small" style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', border: '1px solid var(--divider)'}} />
                      ))}
                    </Box>
                  </Box>

                  {/* Calendar Celebrations */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '10px' }}>
                      Major Calendar Holidays
                    </Typography>
                    <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {activeDialogNode.holidays.map((holiday, idx) => (
                        <Chip key={idx} label={holiday} size="small" style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', border: '1px solid var(--divider)'}} />
                      ))}
                    </Box>
                  </Box>

                </Grid>

                {/* Right Column - Academic summaries */}
                <Grid size={{ xs: 12, md: 7 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Historical Narrative */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Historical Background & Context
                    </Typography>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.84rem' }}>
                      {activeDialogNode.historicalBackground}
                    </Typography>
                  </Box>

                  {/* Scriptures Section */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Sacred Scriptures & Canonical Texts
                    </Typography>
                    <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {activeDialogNode.scriptures.map((text, idx) => (
                        <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(28, 176, 246, 0.05)', border: '1px solid rgba(28, 176, 246, 0.15)', padding: '4px 10px', borderRadius: '8px' }}>
                          <BookOpen size={12} style={{ color: 'var(--primary-main)' }} />
                          <Typography variant="caption" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.7rem' }}>
                            {text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Principal Branches list */}
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Principal Denominational Branches
                    </Typography>
                    <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {activeDialogNode.branches.map((br, idx) => (
                        <Chip key={idx} label={br} size="small" style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--divider)', color: 'var(--text-primary)'}} />
                      ))}
                    </Box>
                  </Box>

                  {/* Related traditions */}
                  {activeDialogNode.relatedReligions && activeDialogNode.relatedReligions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" style={{ fontWeight: 900, color: 'var(--primary-main)', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Related traditions & Cultural links
                      </Typography>
                      <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {activeDialogNode.relatedReligions.map((rel, idx) => (
                          <Chip key={idx} label={rel} size="small" style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--divider)', color: 'var(--text-secondary)'}} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Academic Neutrality Disclaimer */}
                  <Box style={{ marginTop: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderLeft: '3px solid var(--text-disabled)', borderRadius: '0 8px 8px 0' }}>
                    <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.68rem', lineHeight: 1.4, display: 'block' }}>
                      <strong>Scholarly Note:</strong> The timelines, historical accounts, and statistics presented represent prevailing academic histories and consensus. Certain founding periods, scriptures, or genealogies may hold differing dates, traditional histories, or interpretations among religious adherents and theologians.
                    </Typography>
                  </Box>

                </Grid>

              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

    </Box>
  );
};
