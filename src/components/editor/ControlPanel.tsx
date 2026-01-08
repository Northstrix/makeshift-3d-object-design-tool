"use client";

import {
  Palette,
  Layers,
  Gem,
  GlassWater,
  Download,
  FileJson,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Axis3d,
  Grid,
  CaseSensitive,
  Sparkles,
  Blend,
  Pen,
  Highlighter,
  PaintBucket,
  Type,
  Pilcrow,
  Copy,
  Waves,
  Sparkle,
  Camera,
  Zap,
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { FloatingLabelInput, FloatingLabelCombobox } from '@/components/ui/floating-label-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import type { EditorState, DesignLayer, MaterialType, ShapeType, ParticleStyle, CameraView } from './Editor';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ColorPicker from '../ui/color-picker';
import { Switch } from '../ui/switch';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { AppFooter } from './AppFooter';
import { SidebarToggle } from './SidebarToggle';
import useIsRTL from '@/hooks/use-is-rtl';

interface ControlPanelProps {
  state: EditorState;
  dispatch: React.Dispatch<any>;
  onExportHtml: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  isSidebarOpen: boolean;
  isContentVisible: boolean;
  handleFold: () => void;
  onSidebarAnimationComplete: (definition: "expanded" | "collapsed") => void;
  onContentAnimationComplete: (definition: "visible" | "hidden") => void;
}

const sidebarVariants = {
  expanded: {
    width: "350px",
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  collapsed: {
    width: "0px",
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const contentVariants = {
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut" },
    pointerEvents: "auto" as const,
  },
  hidden: {
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "easeIn" },
    pointerEvents: "none" as const,
  },
};


export function ControlPanel({
  state,
  dispatch,
  onExportHtml,
  onExportJson,
  onImportJson,
  isSidebarOpen,
  isContentVisible,
  handleFold,
  onSidebarAnimationComplete,
  onContentAnimationComplete,
}: ControlPanelProps) {
  const selectedLayer = state.layers.find(l => l.id === state.selectedLayer);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isRTL = useIsRTL();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = 0;
        }
    }
  }, []);

  const updateLayer = (id: string, data: Partial<DesignLayer>) => {
    dispatch({ type: 'UPDATE_LAYER', payload: { id, data } });
  };
  
  const updateGlobal = (data: Partial<EditorState>) => {
    dispatch({ type: 'UPDATE_GLOBAL', payload: data });
  };

  const handleFloatChange = (key: keyof DesignLayer) => (value: string) => {
    if (selectedLayer) {
        let parsed = parseFloat(value);
        if (isNaN(parsed)) parsed = 0;
        updateLayer(selectedLayer.id, { [key]: parsed });
    }
  };

  const handleIntChange = (key: keyof DesignLayer) => (value: string) => {
    if (selectedLayer) {
        let parsed = parseInt(value, 10);
        if (isNaN(parsed)) parsed = 0;
        updateLayer(selectedLayer.id, { [key]: parsed });
    }
  };
  
  const shapeOptions: {value: ShapeType, label: string}[] = [
      { value: "rect", label: "Rectangle" },
      { value: "circle", label: "Circle" },
      { value: "half-square-half-circle", label: "Half Square Half Circle" },
      { value: "half-circle", label: "Half Circle" },
      { value: "text", label: "Text" },
  ]

  const materialOptions: {value: MaterialType, label: string}[] = [
      { value: "standard", label: "Standard (PBR)"},
      { value: "phong", label: "Phong (Shiny)"},
      { value: "lambert", label: "Lambert (Matte)"},
      { value: "normal", label: "Chameleon (Debug)"},
      { value: "metal", label: "Metal"},
      { value: "particle", label: "Particles"},
      { value: 'flow', label: 'Flow Shader' },
      { value: 'melt', label: 'Melt Shader' },
      { value: 'magnetic-stripes', label: 'Magnetic Stripes' },
  ]
  
  const particleStyleOptions: {value: ParticleStyle, label: string}[] = [
      { value: 'glow', label: 'Glow' },
      { value: 'ring', label: 'Ring' },
      { value: 'firefly', label: 'Firefly' },
  ]

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Oswald', label: 'Oswald' },
    { value: 'Slabo 27px', label: 'Slabo 27px' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'PT Sans', label: 'PT Sans' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Noto Sans', label: 'Noto Sans' },
    { value: 'Ubuntu', label: 'Ubuntu' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Lora', label: 'Lora' },
    { value: 'Poppins', label: 'Poppins' },
  ];

  const setCameraView = (view: CameraView) => {
    dispatch({ type: 'SET_CAMERA_VIEW', payload: view });
  }

  const showColorPickers = selectedLayer && !['normal', 'flow', 'melt'].includes(selectedLayer.materialType);
  const showEmissivePicker = selectedLayer && !['normal', 'flow', 'melt', 'magnetic-stripes'].includes(selectedLayer.materialType);

  return (
    <motion.aside
      initial={false}
      animate={isSidebarOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onAnimationComplete={onSidebarAnimationComplete}
      className="bg-card flex flex-col border-r border-border h-screen"
    >
      <motion.div
        initial={false}
        animate={isContentVisible && isSidebarOpen ? "visible" : "hidden"}
        variants={contentVariants}
        onAnimationComplete={onContentAnimationComplete}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <a href="/" className="group flex items-center gap-3">
              <img src="/logo.webp" alt="App Logo" width={46} height={46} className="border border-border rounded-md" />
              <div>
                <h1 className="font-headline font-semibold text-foreground group-hover:text-primary transition-colors">Makeshift 3D</h1>
                <h1 className="font-headline font-semibold text-foreground group-hover:text-primary transition-colors">Object Design Tool</h1>              </div>
            </a>
            <SidebarToggle onClick={handleFold} isRTL={isRTL} />
        </div>
        <ScrollArea ref={scrollAreaRef} className="flex-grow">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold font-headline text-base mb-4">Configuration</h3>
              <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={onImportJson}>
                      <FileJson className="mr-2" />
                      Import JSON
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={onExportJson}>
                      <Download className="mr-2" />
                      Export JSON
                  </Button>
              </div>
            </div>
            <Separator/>
              <div>
                  <h3 className="font-semibold font-headline text-base mb-4">Canvas</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                          <Label htmlFor="axes-switch" className="flex items-center gap-2"><Axis3d/> Show Axes</Label>
                          <Switch id="axes-switch" checked={state.showAxes} onCheckedChange={(c) => dispatch({ type: 'SET_VISIBILITY', payload: { key: 'showAxes', value: c }})} />
                      </div>
                      <div className="flex items-center justify-between">
                          <Label htmlFor="labels-switch" className="flex items-center gap-2"><CaseSensitive/> Show Axis Labels</Label>
                          <Switch id="labels-switch" checked={state.showAxisLabels} onCheckedChange={(c) => dispatch({ type: 'SET_VISIBILITY', payload: { key: 'showAxisLabels', value: c }})} />
                      </div>
                      <div className="flex items-center justify-between">
                          <Label htmlFor="grid-switch" className="flex items-center gap-2"><Grid /> Show Grid</Label>
                          <Switch id="grid-switch" checked={state.showGrid} onCheckedChange={(c) => dispatch({ type: 'SET_VISIBILITY', payload: { key: 'showGrid', value: c }})} />
                      </div>
                  </div>
              </div>
            <Separator/>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold font-headline text-base flex items-center gap-2"><Layers /> Layers</h3>
                <Button size="sm" onClick={() => dispatch({ type: 'ADD_LAYER' })}>
                  <Plus className="mr-2" /> Add Layer
                </Button>
              </div>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {state.layers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No layers yet. Add one to begin.</p>
                    )}
                    {state.layers.map((layer, index) => (
                      <Draggable key={layer.id} draggableId={layer.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center gap-2 p-3 rounded-lg transition-all ${state.selectedLayer === layer.id ? 'bg-primary/10 border border-primary' : 'bg-transparent border border-transparent'} ${snapshot.isDragging ? 'bg-primary/20 shadow-lg' : ''}`}
                            onClick={() => dispatch({ type: 'SELECT_LAYER', payload: { id: layer.id } })}
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                            <span className="font-medium text-sm flex-grow truncate">{layer.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                              >
                                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch({ type: 'CLONE_LAYER', payload: { id: layer.id } })
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch({ type: 'REMOVE_LAYER', payload: { id: layer.id } })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <Separator />
            
            {selectedLayer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Pen className="h-5 w-5" />
                  <FloatingLabelInput
                      label="Layer Name"
                      value={selectedLayer.name}
                      onValueChange={(v) => updateLayer(selectedLayer.id, { name: v })}
                  />
                </div>
                  <Accordion type="multiple" defaultValue={['transform', 'appearance', 'material']} className="w-full">
                    
                    {/* Transform */}
                    <AccordionItem value="transform">
                      <AccordionTrigger className="text-sm font-medium">Transform</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <FloatingLabelCombobox 
                              label="Shape"
                              options={shapeOptions}
                              value={selectedLayer.shape}
                              onValueChange={(v) => updateLayer(selectedLayer.id, { shape: v as ShapeType })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <FloatingLabelInput label="X" type="number" step="0.01" value={String(selectedLayer.x)} onValueChange={handleFloatChange('x')} />
                          <FloatingLabelInput label="Y" type="number" step="0.01" value={String(selectedLayer.y)} onValueChange={handleFloatChange('y')} />
                          <FloatingLabelInput label="Z" type="number" step="0.01" value={String(selectedLayer.z)} onValueChange={handleFloatChange('z')} />
                        </div>
                        {selectedLayer.shape !== 'text' && (
                          <div className="grid grid-cols-2 gap-2">
                            <FloatingLabelInput label="Width" type="number" step="0.01" value={String(selectedLayer.width)} onValueChange={handleFloatChange('width')} />
                            <FloatingLabelInput label="Height" type="number" step="0.01" value={String(selectedLayer.height)} onValueChange={handleFloatChange('height')} />
                          </div>
                        )}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm"><GripVertical className="h-4 w-4" /> Rotation</Label>
                            <div className="flex items-center gap-4">
                              <Slider value={[selectedLayer.rotation]} onValueChange={([v]) => updateLayer(selectedLayer.id, { rotation: v })} min={0} max={360} step={1} />
                              <span className="w-16 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.rotation}°</span>
                            </div>
                          </div>
                          {selectedLayer.shape === 'rect' && (
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-sm">Border Radius</Label>
                              <div className="flex items-center gap-4">
                                <Slider value={[selectedLayer.borderRadius]} onValueChange={([v]) => updateLayer(selectedLayer.id, { borderRadius: v })} min={0} max={200} step={1} />
                                <span className="w-16 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.borderRadius}</span>
                              </div>
                            </div>
                          )}
                          {selectedLayer.shape === 'half-circle' && (
                            <div className="space-y-2">
                              <Label>Elongation</Label>
                              <div className="flex items-center gap-4">
                                  <Slider value={[selectedLayer.elongation]} onValueChange={([v]) => updateLayer(selectedLayer.id, { elongation: v })} min={0} max={100} step={1} />
                                  <span className="w-16 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.elongation}</span>
                              </div>
                            </div>
                          )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Text */}
                    {selectedLayer.shape === 'text' && (
                      <AccordionItem value="text-properties">
                        <AccordionTrigger className="text-sm font-medium">Text Properties</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <FloatingLabelInput label="Text" value={selectedLayer.text} onValueChange={v => updateLayer(selectedLayer.id, { text: v })} />
                          <FloatingLabelCombobox label="Font Family" options={fontOptions} value={selectedLayer.fontFamily} onValueChange={v => updateLayer(selectedLayer.id, { fontFamily: v })} />
                          <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-sm">Font Weight</Label>
                              <div className="flex items-center gap-4">
                                  <Slider 
                                      value={[selectedLayer.fontWeight]} 
                                      onValueChange={([v]) => updateLayer(selectedLayer.id, { fontWeight: v })} 
                                      min={100} max={900} step={100} 
                                  />
                                  <span className="w-16 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.fontWeight}</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <FloatingLabelInput label="Font Size" type="number" step="0.01" value={String(selectedLayer.fontSize)} onValueChange={handleFloatChange('fontSize')} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Appearance */}
                    <AccordionItem value="appearance">
                      <AccordionTrigger className="text-sm font-medium">Appearance</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {showColorPickers && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm"><Palette className="h-4 w-4" /> Color</Label>
                            <ColorPicker 
                                value={selectedLayer.color}
                                onValueChange={(c) => {
                                    updateLayer(selectedLayer.id, { color: c });
                                }}
                                showContrast={false}
                                colorPreviewPosition="none"
                              />
                          </div>
                        )}
                        {selectedLayer.shape !== 'text' && selectedLayer.materialType !== 'particle' && (
                          <>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="fill-switch" className="flex items-center gap-2"><PaintBucket /> Fill</Label>
                              <Switch id="fill-switch" checked={selectedLayer.fill} onCheckedChange={(c) => updateLayer(selectedLayer.id, { fill: c })} />
                            </div>
                            {!selectedLayer.fill && (
                              <div className="space-y-2">
                                  <FloatingLabelInput label="Border Width" type="number" step="0.01" value={String(selectedLayer.borderWidth)} onValueChange={handleFloatChange('borderWidth')} />
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm"><Blend className="h-4 w-4" /> Opacity</Label>
                            <div className="flex items-center gap-4">
                            <Slider value={[selectedLayer.opacity]} onValueChange={([v]) => updateLayer(selectedLayer.id, { opacity: v })} min={0} max={1} step={0.01} />
                            <span className="w-14 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.opacity.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {selectedLayer.materialType !== 'particle' && (
                          <div className="space-y-2">
                              <FloatingLabelInput label="Depth" type="number" step="0.01" value={String(selectedLayer.depth)} onValueChange={handleFloatChange('depth')} />
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Material */}
                    <AccordionItem value="material">
                      <AccordionTrigger className="text-sm font-medium">Material</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <FloatingLabelCombobox 
                              label="Type"
                              options={materialOptions}
                              value={selectedLayer.materialType}
                              onValueChange={(v) => updateLayer(selectedLayer.id, { materialType: v as MaterialType })}
                          />
                        </div>
                        {showEmissivePicker && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4" /> Emissive (Glow)</Label>
                          <ColorPicker 
                              value={selectedLayer.emissive}
                              onValueChange={(c) => updateLayer(selectedLayer.id, { emissive: c })}
                              showContrast={false}
                              colorPreviewPosition="none"
                          />
                        </div>
                        )}
                        {selectedLayer.materialType === 'standard' && selectedLayer.materialType !== 'metal' && (
                          <>
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-sm"><Gem className="h-4 w-4" /> Metalness</Label>
                              <div className="flex items-center gap-4">
                                <Slider 
                                  value={[selectedLayer.metalness]} 
                                  onValueChange={([v]) => updateLayer(selectedLayer.id, { metalness: v })} 
                                  min={0} max={1} step={0.01}
                                />
                                <span className="w-14 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.metalness.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-sm"><GlassWater className="h-4 w-4" /> Roughness</Label>
                              <div className="flex items-center gap-4">
                                <Slider 
                                  value={[selectedLayer.roughness]} 
                                  onValueChange={([v]) => updateLayer(selectedLayer.id, { roughness: v })} 
                                  min={0} max={1} step={0.01} 
                                />
                                <span className="w-14 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.roughness.toFixed(2)}</span>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedLayer.materialType === 'particle' && (
                          <div className="space-y-4 pt-4">
                              <FloatingLabelInput label="Particle Count" type="number" value={String(selectedLayer.particleCount)} onValueChange={handleIntChange('particleCount')} />
                              <div className="space-y-2">
                                  <Label className="flex items-center gap-2 text-sm"><Sparkle className="h-4 w-4" /> Particle Size</Label>
                                  <div className="flex items-center gap-4">
                                  <Slider value={[selectedLayer.particleSize]} onValueChange={([v]) => updateLayer(selectedLayer.id, { particleSize: v })} min={0.1} max={10} step={0.1} />
                                  <span className="w-14 text-center text-sm font-mono bg-muted rounded-md py-1">{selectedLayer.particleSize.toFixed(1)}</span>
                                  </div>
                              </div>
                              {selectedLayer.materialType === 'particle' && (
                                <FloatingLabelCombobox 
                                    label="Particle Style"
                                    options={particleStyleOptions}
                                    value={selectedLayer.particleStyle}
                                    onValueChange={(v) => updateLayer(selectedLayer.id, { particleStyle: v as ParticleStyle })}
                                />
                              )}
                          </div>
                        )}
                        { selectedLayer.materialType === 'flow' && (
                          <div className="space-y-6 pt-4">
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Velocity</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowVelocity.toFixed(2)}</span></div><Slider value={[selectedLayer.flowVelocity]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowVelocity: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Detail</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowDetail.toFixed(2)}</span></div><Slider value={[selectedLayer.flowDetail]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowDetail: v })} min={0} max={1} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Twist</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowTwist.toFixed(2)}</span></div><Slider value={[selectedLayer.flowTwist]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowTwist: v })} min={0} max={1} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Speed</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowSpeed.toFixed(2)}</span></div><Slider value={[selectedLayer.flowSpeed]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowSpeed: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Contrast</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowContrast.toFixed(2)}</span></div><Slider value={[selectedLayer.flowContrast]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowContrast: v })} min={0.1} max={5} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Red</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowRgbMultiplierR.toFixed(2)}</span></div><Slider value={[selectedLayer.flowRgbMultiplierR]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowRgbMultiplierR: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Green</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowRgbMultiplierG.toFixed(2)}</span></div><Slider value={[selectedLayer.flowRgbMultiplierG]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowRgbMultiplierG: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Blue</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowRgbMultiplierB.toFixed(2)}</span></div><Slider value={[selectedLayer.flowRgbMultiplierB]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowRgbMultiplierB: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Color Offset</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowColorOffset.toFixed(2)}</span></div><Slider value={[selectedLayer.flowColorOffset]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowColorOffset: v })} min={-1} max={1} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Hue</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowHue.toFixed(0)}</span></div><Slider value={[selectedLayer.flowHue]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowHue: v })} min={0} max={360} step={1} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Saturation</Label><span className="text-xs text-muted-foreground">{selectedLayer.flowSaturation.toFixed(2)}</span></div><Slider value={[selectedLayer.flowSaturation]} onValueChange={([v]) => updateLayer(selectedLayer.id, { flowSaturation: v })} min={0} max={2} step={0.01} /></div>
                          </div>
                        )}
                        {selectedLayer.materialType === 'melt' && (
                          <div className="space-y-6 pt-4">
                              <FloatingLabelInput label="Zoom" type="number" step="0.01" value={String(selectedLayer.meltZoom)} onValueChange={handleFloatChange('meltZoom')} />
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Speed</Label><span className="text-xs text-muted-foreground">{selectedLayer.meltSpeed.toFixed(2)}</span></div><Slider value={[selectedLayer.meltSpeed]} onValueChange={([v]) => updateLayer(selectedLayer.id, { meltSpeed: v })} min={0} max={50} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Detail</Label><span className="text-xs text-muted-foreground">{selectedLayer.meltDetail.toFixed(2)}</span></div><Slider value={[selectedLayer.meltDetail]} onValueChange={([v]) => updateLayer(selectedLayer.id, { meltDetail: v })} min={0} max={1} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Hue</Label><span className="text-xs text-muted-foreground">{selectedLayer.meltHue.toFixed(0)}</span></div><Slider value={[selectedLayer.meltHue]} onValueChange={([v]) => updateLayer(selectedLayer.id, { meltHue: v })} min={0} max={360} step={1} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Saturation</Label><span className="text-xs text-muted-foreground">{selectedLayer.meltSaturation.toFixed(2)}</span></div><Slider value={[selectedLayer.meltSaturation]} onValueChange={([v]) => updateLayer(selectedLayer.id, { meltSaturation: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Contrast</Label><span className="text-xs text-muted-foreground">{selectedLayer.meltContrast.toFixed(2)}</span></div><Slider value={[selectedLayer.meltContrast]} onValueChange={([v]) => updateLayer(selectedLayer.id, { meltContrast: v })} min={0.1} max={5} step={0.01} /></div>
                          </div>
                        )}
                        {selectedLayer.materialType === 'magnetic-stripes' && (
                          <div className="space-y-6 pt-4">
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Intensity</Label><span className="text-xs text-muted-foreground">{selectedLayer.magneticIntensity.toFixed(2)}</span></div><Slider value={[selectedLayer.magneticIntensity]} onValueChange={([v]) => updateLayer(selectedLayer.id, { magneticIntensity: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Arc Frequency</Label><span className="text-xs text-muted-foreground">{selectedLayer.magneticArcFrequency.toFixed(2)}</span></div><Slider value={[selectedLayer.magneticArcFrequency]} onValueChange={([v]) => updateLayer(selectedLayer.id, { magneticArcFrequency: v })} min={0} max={2} step={0.01} /></div>
                              <div className="space-y-2"><div className="flex justify-between items-center"><Label>Glow</Label><span className="text-xs text-muted-foreground">{selectedLayer.magneticGlow.toFixed(2)}</span></div><Slider value={[selectedLayer.magneticGlow]} onValueChange={([v]) => updateLayer(selectedLayer.id, { magneticGlow: v })} min={0} max={2} step={0.01} /></div>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                  <div className="space-y-2" key={i}>
                                      <Label>Color {i}</Label>
                                      <ColorPicker 
                                          value={selectedLayer[`magneticColor${i}`]}
                                          onValueChange={(c) => updateLayer(selectedLayer.id, { [`magneticColor${i}`]: c })}
                                          showContrast={false} colorPreviewPosition="none"
                                      />
                                  </div>
                              ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                  </Accordion>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                Select a layer to edit its properties.
              </div>
            )}

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Advanced</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="abc-labels-switch" className="flex items-center gap-2">
                            <Pilcrow/> Use A,B,C for Axis Labels
                        </Label>
                        <Switch 
                            id="abc-labels-switch" 
                            checked={state.useAbcLabels} 
                            onCheckedChange={(c) => dispatch({ type: 'SET_VISIBILITY', payload: { key: 'useAbcLabels', value: c }})} 
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="custom-axis-colors-switch" className="flex items-center gap-2">
                            Use Custom Axis Colors
                        </Label>
                        <Switch 
                            id="custom-axis-colors-switch" 
                            checked={state.useCustomAxisColors} 
                            onCheckedChange={(c) => updateGlobal({ useCustomAxisColors: c })}
                        />
                    </div>

                    {state.useCustomAxisColors && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>X-Axis Color</Label>
                          <ColorPicker
                            value={state.xAxisColor}
                            onValueChange={(c) => updateGlobal({ xAxisColor: c })}
                            showContrast={false}
                            colorPreviewPosition="none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Y-Axis Color</Label>
                          <ColorPicker
                            value={state.yAxisColor}
                            onValueChange={(c) => updateGlobal({ yAxisColor: c })}
                            showContrast={false}
                            colorPreviewPosition="none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Z-Axis Color</Label>
                          <ColorPicker
                            value={state.zAxisColor}
                            onValueChange={(c) => updateGlobal({ zAxisColor: c })}
                            showContrast={false}
                            colorPreviewPosition="none"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm"><Camera className="h-4 w-4" /> Camera View</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCameraView('default')}>Default</Button>
                            <Button variant="outline" size="sm" onClick={() => setCameraView('top')}>Top (Y)</Button>
                            <Button variant="outline" size="sm" onClick={() => setCameraView('front')}>Front (Z)</Button>
                            <Button variant="outline" size="sm" onClick={() => setCameraView('side')}>Side (X)</Button>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <AppFooter />
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border mt-auto">
          <Button onClick={onExportHtml} className="w-full btn-glow">
            <Download className="mr-2 h-4 w-4" />
            Export to HTML
          </Button>
        </div>
      </motion.div>
    </motion.aside>
  );
}

    