
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
