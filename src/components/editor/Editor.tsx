'use client';

import { useCallback, useReducer, useState } from 'react';
import { ControlPanel } from './ControlPanel';
import { PreviewCanvas } from './PreviewCanvas';
import { exportToHtml } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import FloatingCollapsedIcon from './FloatingCollapsedIcon';
import useIsRTL from '@/hooks/use-is-rtl';

export type MaterialType = 'standard' | 'phong' | 'lambert' | 'normal' | 'metal' | 'particle' | 'flow' | 'melt' | 'magnetic-stripes';
export type ParticleStyle = 'glow' | 'ring' | 'firefly';

export type ShapeType = 'rect' | 'circle' | 'half-circle' | 'half-square-half-circle' | 'text';
export type CameraView = 'default' | 'top' | 'front' | 'side' | null;

export interface DesignLayer {
  id: string;
  name: string;
  visible: boolean;
  shape: ShapeType;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotation: number;
  borderRadius: number;
  elongation: number;
  color: string;
  opacity: number;
  depth: number;
  materialType: MaterialType;
  metalness: number;
  roughness: number;
  shininess: number;
  emissive: string;
  fill: boolean;
  borderWidth: number;
  // Text properties
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  // Particle properties
  particleCount: number;
  particleSize: number;
  particleStyle: ParticleStyle;
  // Flow Shader
  flowVelocity: number;
  flowDetail: number;
  flowTwist: number;
  flowSpeed: number;
  flowContrast: number;
  flowRgbMultiplierR: number;
  flowRgbMultiplierG: number;
  flowRgbMultiplierB: number;
  flowColorOffset: number;
  flowHue: number;
  flowSaturation: number;
  // Melt Shader
  meltSpeed: number;
  meltZoom: number;
  meltDetail: number;
  meltHue: number;
  meltSaturation: number;
  meltContrast: number;
  // Magnetic Stripes Shader
  magneticIntensity: number;
  magneticArcFrequency: number;
  magneticGlow: number;
  magneticColor1: string;
  magneticColor2: string;
  magneticColor3: string;
  magneticColor4: string;
  magneticColor5: string;
  magneticColor6: string;
  magneticColor7: string;
  magneticColor8: string;
}

export interface EditorState {
  layers: DesignLayer[];
  selectedLayer: string | null;
  showAxes: boolean;
  showGrid: boolean;
  showAxisLabels: boolean;
  useAbcLabels: boolean;
  useCustomAxisColors: boolean;
  cameraView: CameraView;
  xAxisColor: string;
  yAxisColor: string;
  zAxisColor: string;
}

type EditorAction =
  | { type: 'ADD_LAYER' }
  | { type: 'REMOVE_LAYER'; payload: { id: string } }
  | { type: 'CLONE_LAYER'; payload: { id: string } }
  | { type: 'UPDATE_LAYER'; payload: { id: string; data: Partial<DesignLayer> } }
  | { type: 'UPDATE_GLOBAL'; payload: Partial<EditorState> }
  | { type: 'SELECT_LAYER'; payload: { id: string | null } }
  | { type: 'SET_VISIBILITY', payload: { key: 'showAxes' | 'showGrid' | 'showAxisLabels' | 'useAbcLabels', value: boolean } }
  | { type: 'SET_STATE'; payload: EditorState }
  | { type: 'REORDER_LAYERS', payload: { startIndex: number, endIndex: number } }
  | { type: 'SET_CAMERA_VIEW', payload: CameraView };

const defaultLayerProps: Omit<DesignLayer, 'id' | 'name'> = {
  visible: true,
  shape: 'rect',
  x: 0,
  y: 0,
  z: 0,
  width: 100,
  height: 100,
  rotation: 0,
  borderRadius: 0,
  elongation: 0,
  color: '#83F63C',
  opacity: 1,
  depth: 10,
  materialType: 'standard',
  metalness: 0.2,
  roughness: 0.8,
  shininess: 30,
  emissive: '#000000',
  fill: true,
  borderWidth: 2,
  text: 'Namer UI',
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: 700,
  particleCount: 1000,
  particleSize: 1.5,
  particleStyle: 'glow',
  flowVelocity: 0.5,
  flowDetail: 0.5,
  flowTwist: 0.5,
  flowSpeed: 0.5,
  flowContrast: 1,
  flowRgbMultiplierR: 1,
  flowRgbMultiplierG: 1,
  flowRgbMultiplierB: 1,
  flowColorOffset: 0,
  flowHue: 0,
  flowSaturation: 1,
  meltSpeed: 0.5,
  meltZoom: 1,
  meltDetail: 0.5,
  meltHue: 0,
  meltSaturation: 1,
  meltContrast: 1,
  magneticIntensity: 0.7,
  magneticArcFrequency: 0.65,
  magneticGlow: 0.6,
  magneticColor1: '#260500',
  magneticColor2: '#661a05',
  magneticColor3: '#e64d0d',
  magneticColor4: '#ff801a',
  magneticColor5: '#ffa833',
  magneticColor6: '#ffd453',
  magneticColor7: '#ffeadd',
  magneticColor8: '#cc240d',
};

const initialState: EditorState = {
  layers: [],
  selectedLayer: null,
  showAxes: true,
  showGrid: true,
  showAxisLabels: true,
  useAbcLabels: false,
  useCustomAxisColors: false,
  cameraView: null,
  xAxisColor: '#3C83F6',
  yAxisColor: '#AF3CF6',
  zAxisColor: '#3CF6DD',
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_LAYER': {
      const newLayer: DesignLayer = {
        ...defaultLayerProps,
        id: nanoid(),
        name: `Layer ${state.layers.length + 1}`,
      };
      return {
        ...state,
        layers: [...state.layers, newLayer],
        selectedLayer: newLayer.id,
      };
    }
    case 'REMOVE_LAYER': {
        const newLayers = state.layers.filter(l => l.id !== action.payload.id);
        return {
            ...state,
            layers: newLayers,
            selectedLayer: state.selectedLayer === action.payload.id ? newLayers[0]?.id || null : state.selectedLayer,
        };
    }
    case 'CLONE_LAYER': {
      const layerToClone = state.layers.find(l => l.id === action.payload.id);
      if (!layerToClone) return state;

      const newLayer: DesignLayer = {
        ...layerToClone,
        id: nanoid(),
        name: `${layerToClone.name} (Copy)`,
      };

      const originalIndex = state.layers.findIndex(l => l.id === action.payload.id);
      const newLayers = [...state.layers];
      newLayers.splice(originalIndex + 1, 0, newLayer);

      return {
        ...state,
        layers: newLayers,
        selectedLayer: newLayer.id,
      };
    }
    case 'REORDER_LAYERS': {
      const { startIndex, endIndex } = action.payload;
      const newLayers = Array.from(state.layers);
      const [removed] = newLayers.splice(startIndex, 1);
      newLayers.splice(endIndex, 0, removed);
      return { ...state, layers: newLayers };
    }
    case 'UPDATE_LAYER': {
      const { id, data } = action.payload;
      return {
        ...state,
        layers: state.layers.map(l => {
          if (l.id === id) {
            const updatedLayer = { ...l, ...data };
            if (data.materialType === 'metal') {
              updatedLayer.metalness = 1.0;
              updatedLayer.roughness = 0.4;
            }
            return updatedLayer;
          }
          return l;
        }),
      };
    }
    case 'UPDATE_GLOBAL': {
      return { ...state, ...action.payload };
    }
    case 'SELECT_LAYER': {
      return { ...state, selectedLayer: action.payload.id };
    }
     case 'SET_VISIBILITY': {
      return { ...state, [action.payload.key]: action.payload.value };
    }
     case 'SET_CAMERA_VIEW': {
      return { ...state, cameraView: action.payload };
    }
    case 'SET_STATE': {
      const importedState = action.payload;
      const layersWithDefaults = importedState.layers.map((l: Partial<DesignLayer>): DesignLayer => ({
        ...defaultLayerProps,
        ...l,
        id: l.id || nanoid(),
        name: l.name || `Layer ${state.layers.length + 1}`,
      }));
      return {
        ...initialState,
        ...importedState,
        layers: layersWithDefaults,
        selectedLayer: layersWithDefaults[0]?.id || null,
      };
    }
    default:
      return state;
  }
}

const safeJsonParse = (json: string): EditorState | null => {
  try {
    const parsed = JSON.parse(json);
    if (parsed && Array.isArray(parsed.layers)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};


export default function Editor() {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [showFloatingIcon, setShowFloatingIcon] = useState(false);
  const [triggerResize, setTriggerResize] = useState(0);
  const isRTL = useIsRTL();
  
  const handleFold = () => {
    setIsContentVisible(false);
    setTimeout(() => setTriggerResize(c => c + 1), 550);
  };
  
  const handleUnfold = () => {
    setShowFloatingIcon(false);
    setIsSidebarOpen(true);
    setTimeout(() => setTriggerResize(c => c + 1), 550);
  };
  
  const onContentAnimationComplete = (definition: "visible" | "hidden") => {
    if (definition === "hidden") setIsSidebarOpen(false);
  };

  const onSidebarAnimationComplete = (definition: "expanded" | "collapsed") => {
    if (definition === "expanded") setIsContentVisible(true);
    if (definition === "collapsed") setShowFloatingIcon(true);
  };


  const handleExport = useCallback(() => {
    try {
        exportToHtml(state);
    } catch(error) {
        console.error("Export failed:", error);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Something went wrong during the export process.",
        });
    }
  }, [state, toast]);

  const handleJsonExport = useCallback(() => {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast({ title: 'JSON Exported', description: 'Your design has been saved to design.json.' });
  }, [state, toast]);

  const handleJsonImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const newState = safeJsonParse(result);
                if(newState) {
                    dispatch({ type: 'SET_STATE', payload: newState });
                    toast({ title: 'Import Successful', description: 'Your design has been loaded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Import Failed', description: 'The JSON file is invalid or corrupted.' });
                }
            }
        };
        reader.onerror = () => {
             toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not read the file.' });
        }
        reader.readAsText(file);
    };
    input.click();
  }, [toast]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    dispatch({
      type: 'REORDER_LAYERS',
      payload: {
        startIndex: result.source.index,
        endIndex: result.destination.index,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <FloatingCollapsedIcon
            visible={showFloatingIcon}
            onClick={handleUnfold}
            isRTL={isRTL}
          />
        <div 
            className="grid h-screen transition-all duration-500"
            style={{
                gridTemplateColumns: isSidebarOpen ? '350px 1fr' : '0px 1fr'
            }}
        >
        <ControlPanel
            state={state}
            dispatch={dispatch}
            onExportHtml={handleExport}
            onExportJson={handleJsonExport}
            onImportJson={handleJsonImport}
            isSidebarOpen={isSidebarOpen}
            isContentVisible={isContentVisible}
            handleFold={handleFold}
            onSidebarAnimationComplete={onSidebarAnimationComplete}
            onContentAnimationComplete={onContentAnimationComplete}
        />
        <div className="relative h-full w-full bg-background/50">
            <PreviewCanvas 
              state={state}
              dispatch={dispatch}
              triggerResize={triggerResize}
            />
        </div>
        </div>
    </DragDropContext>
  );
}
