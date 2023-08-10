export type Context = Document | Element | DocumentFragment;
export interface IContextElement {
  element: Element | Document | DocumentFragment | null;
  error: Error | null;
}

export interface IHtmlInfo {
  htmlSize: number;
  nodesNum: number;
}
