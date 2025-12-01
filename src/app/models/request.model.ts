export interface ApiRequest {
  id: string;
  name: string;
  method: string;
  path: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number; // in milliseconds
  trace: Trace;
}

export interface Trace {
  requestId: string;
  spans: TraceSpan[];
}

export interface TraceSpan {
  id: string;
  name: string;
  service: string;
  type: 'client' | 'server' | 'database' | 'cache' | 'queue';
  parentId?: string;
  startTime: number; // relative to trace start in ms
  duration: number; // in milliseconds
  status: 'success' | 'error' | 'warning' | 'processing';
  logs: LogEntry[];
  tags?: { [key: string]: string };
}

export interface LogEntry {
  timestamp: number; // relative to span start in ms
  level: 'info' | 'warn' | 'error' | 'debug' | 'trace';
  message: string;
  fields?: { [key: string]: any };
}
