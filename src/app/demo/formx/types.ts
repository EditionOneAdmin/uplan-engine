export interface Point {
  x: number;
  y: number;
}

export interface FormXShape {
  id: string;
  type: 'rect' | 'lshape' | 'ushape' | 'polygon';
  points: Point[];
}

export interface FormXConfig {
  geschosse: number;
  raumhoehe: number;
  weAnzahl: number | 'auto';
  nufEffizienz: number;
  fensteranteil: number;
  bauweise: 'Mauerwerk' | 'Stahlbeton';
}

export type ToolType = 'select' | 'rect' | 'lshape' | 'ushape' | 'polygon';

export interface FormXState {
  shapes: FormXShape[];
  selectedShapeId: string | null;
  activeTool: ToolType;
  gridVisible: boolean;
  snapEnabled: boolean;
  zoom: number;
  panOffset: Point;
  config: FormXConfig;
  history: FormXShape[][];
  historyIndex: number;
}

export interface FormXMetrics {
  grundflaeche: number;
  umfang: number;
  bgf: number;
  nuf: number;
  awf: number;
  hoehe: number;
  gebaeudeKlasse: number | string;
  avVerhaeltnis: number;
  kompaktheit: number;
  weAnzahl: number;
  weGroesse: number;
  stellplaetze: number;
  fassadeNuf: number;
  fensterflaeche: number;
  dachflaeche: number;
  iwf: number;
}
