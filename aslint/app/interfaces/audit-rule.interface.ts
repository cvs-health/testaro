import { $severity, IssueCategory } from '../constants/accessibility';

export enum AuditStandards {
  wcag = 'wcag',
  essential = 'essential',
  css = 'css',
  html = 'html'
}

export enum EssentialVersion {
  'v10' = '1.0'
}

export enum WcagVersion {
  'v20' = '2.0',
  'v21' = '2.1'
}

export enum CssVersion {
  'v20' = '2.0',
  'v30' = '3.0'
}

export enum HtmlVersion {
  'v5' = '5.0'
}

export enum WcagLevel {
  'A' = 'A',
  'AA' = 'AA',
  'AAA' = 'AAA'
}

export enum WcagTechniques {
  sufficient = 'sufficient',
  advisory = 'advisory',
  failure = 'failure'
}

export interface IAuditResource {
  content: string;
  url: string;
}

export interface IAuditTechnique {
  id: string;
  link: string;
  standard: AuditStandards;
}

export interface IWcagSuccessCriteria {
  handle: string;
  level: WcagLevel;
  num: string;
  title: string;
  techniques: any[];
  versions: WcagVersion[];
}

export interface IEssential {
  version: EssentialVersion;
}

interface ICss {
  version: CssVersion;
}

interface IHtml {
  version: HtmlVersion;
}

export interface IAuditStandard {
  description: string;
  id: AuditStandards;
  url: string;
  [AuditStandards.css]?: ICss;
  [AuditStandards.essential]?: IEssential;
  [AuditStandards.html]?: IHtml;
  [AuditStandards.wcag]?: IWcagSuccessCriteria;
}

export interface IAuditRule {
  categories: IssueCategory[];
  description: string;
  isMarkedAsFalsePositive: boolean;
  isSelectedForScanning: boolean;
  resources: IAuditResource[];
  ruleId: string;
  severity: $severity;
  standards: IAuditStandard[];
  techniques: IAuditTechnique[];
  title: string;
}
