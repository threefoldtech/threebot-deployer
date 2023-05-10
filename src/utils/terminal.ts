export enum TerminalStatus {
  requested = 'requested',
  responsed = 'responsed',
  pinding = 'pinding',
  success = 'success',
  failed = 'failed',
}

export interface TerminalHistory {
  message: string;
  state: string;
  status: TerminalStatus;
}

export interface TerminalComponent extends HTMLElement {
  commit?(state: string, message: string, status: string): string;
}
