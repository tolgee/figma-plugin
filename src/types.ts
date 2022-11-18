import { EventHandler } from '@create-figma-plugin/utilities'

export interface SetupHandle extends EventHandler {
  name: 'SETUP'
  handler: (config: Partial<TolgeeConfig>) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export interface SyncCompleteHandler extends EventHandler {
  name: 'SYNC_COMPLETE'
  handler: () => void
}

export interface TranslationsUpdateHandler extends EventHandler {
  name: 'UPDATE_NODES'
  handler: (nodes: Node[]) => void
}

export interface Node {
  name: string;
  characters: string;
  id: string;
}

export interface TolgeeConfig extends Record<string, string> { url: string, apiKey: string, lang: string };
export interface FormattedNode { characters: string, id: string, name: string };