
export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface GCodeLine {
  id: string;
  lineNum: string;
  command: string;
  comment?: string;
  params?: string;
  type?: 'motion' | 'setup' | 'system';
}

export interface MachineStatus {
  spindleRpm: number;
  feedRate: number;
  isSimulating: boolean;
  progress: number;
  activeLineIndex: number;
  coolant: boolean;
  error?: string;
}

export interface Tool {
  id: string;
  name: string;
  diameter: string;
  length: string;
  type: string;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
}

export type RenderMode = 'SOLID' | 'WIREFRAME' | 'X-RAY' | 'PLASTIC';
export type Projection = 'PERSPECTIVE' | 'ORTHOGRAPHIC';

/** Scene display settings owned by ViewSidebar's "View Settings" panel but
 * consumed by Viewport -- lifted up to App so both sides read/write the
 * same state instead of ViewSidebar's controls being disconnected chrome. */
export interface ViewSettings {
  machineHousing: boolean;
  fixturesClamps: boolean;
  rapidLines: boolean;
  toolpathHistory: boolean;
  renderMode: RenderMode;
  projection: Projection;
  gridOpacity: number;
}
