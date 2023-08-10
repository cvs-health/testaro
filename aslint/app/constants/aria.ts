export const ROLES: Readonly<{ [key: string]: any }> = Object.freeze({
  alert: {
    namefrom: ['author'],
    parent: ['region']
  },
  alertdialog: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['alert', 'dialog']
  },
  application: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['landmark']
  },
  article: {
    namefrom: ['author'],
    parent: ['document', 'region']
  },
  banner: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  button: {
    childpresentational: true,
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['command'],
    properties: ['aria-expanded', 'aria-pressed']
  },
  checkbox: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['input'],
    properties: ['aria-checked'],
    requiredProperties: ['aria-checked']
  },
  columnheader: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['gridcell', 'sectionhead', 'widget'],
    properties: ['aria-sort'],
    scope: ['row']
  },
  combobox: {
    mustcontain: ['listbox', 'textbox'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['select'],
    properties: ['aria-expanded', 'aria-autocomplete', 'aria-required'],
    requiredProperties: ['aria-expanded']
  },
  command: {
    abstract: true,
    namefrom: ['author'],
    parent: ['widget']
  },
  complementary: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  composite: {
    abstract: true,
    childpresentational: false,
    namefrom: ['author'],
    parent: ['widget'],
    properties: ['aria-activedescendant']
  },
  contentinfo: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  definition: {
    namefrom: ['author'],
    parent: ['section']
  },
  dialog: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['window']
  },
  directory: {
    namefrom: ['contents', 'author'],
    parent: ['list']
  },
  document: {
    namefrom: [' author'],
    namerequired: true,
    parent: ['structure'],
    properties: ['aria-expanded']
  },
  form: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  grid: {
    mustcontain: ['row', 'rowgroup'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['composite', 'region'],
    properties: ['aria-level', 'aria-multiselectable', 'aria-readonly']
  },
  gridcell: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['section', 'widget'],
    properties: ['aria-readonly', 'aria-required', 'aria-selected'],
    scope: ['row']
  },
  group: {
    namefrom: [' author'],
    parent: ['section'],
    properties: ['aria-activedescendant']
  },
  heading: {
    namerequired: true,
    parent: ['sectionhead'],
    properties: ['aria-level']
  },
  img: {
    childpresentational: true,
    namefrom: ['author'],
    namerequired: true,
    parent: ['section']
  },
  input: {
    abstract: true,
    namefrom: ['author'],
    parent: ['widget']
  },
  landmark: {
    abstract: true,
    namefrom: ['contents', 'author'],
    namerequired: false,
    parent: ['region']
  },
  link: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['command'],
    properties: ['aria-expanded']
  },
  list: {
    mustcontain: ['group', 'listitem'],
    namefrom: ['author'],
    parent: ['region']
  },
  listbox: {
    mustcontain: ['option'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['list', 'select'],
    properties: ['aria-multiselectable', 'aria-required']
  },
  listitem: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['section'],
    properties: ['aria-level', 'aria-posinset', 'aria-setsize'],
    scope: ['list']
  },
  log: {
    namefrom: [' author'],
    namerequired: true,
    parent: ['region']
  },
  main: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  marquee: {
    namerequired: true,
    parent: ['section']
  },
  math: {
    childpresentational: true,
    namefrom: ['author'],
    parent: ['section']
  },
  menu: {
    mustcontain: [
      'group',
      'menuitemradio',
      'menuitem',
      'menuitemcheckbox'
    ],
    namefrom: ['author'],
    namerequired: true,
    parent: ['list', 'select']
  },
  menubar: {
    namefrom: ['author'],
    parent: ['menu']
  },
  menuitem: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['command'],
    scope: ['menu', 'menubar']
  },
  menuitemcheckbox: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['checkbox', 'menuitem'],
    scope: ['menu', 'menubar']
  },
  menuitemradio: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['menuitemcheckbox', 'radio'],
    scope: ['menu', 'menubar']
  },
  navigation: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  note: {
    namefrom: ['author'],
    parent: ['section']
  },
  option: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['input'],
    properties: [
      'aria-checked',
      'aria-posinset',
      'aria-selected',
      'aria-setsize'
    ]
  },
  presentation: {
    parent: ['structure']
  },
  progressbar: {
    childpresentational: true,
    namefrom: ['author'],
    namerequired: true,
    parent: ['range']
  },
  radio: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['checkbox', 'option']
  },
  radiogroup: {
    mustcontain: ['radio'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['select'],
    properties: ['aria-required']
  },
  range: {
    abstract: true,
    namefrom: ['author'],
    parent: ['widget'],
    properties: [
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow',
      'aria-valuetext'
    ]
  },
  region: {
    namefrom: [' author'],
    parent: ['section']
  },
  roletype: {
    abstract: true,
    properties: [
      'aria-atomic',
      'aria-busy',
      'aria-controls',
      'aria-describedby',
      'aria-disabled',
      'aria-dropeffect',
      'aria-flowto',
      'aria-grabbed',
      'aria-haspopup',
      'aria-hidden',
      'aria-invalid',
      'aria-label',
      'aria-labelledby',
      'aria-live',
      'aria-owns',
      'aria-relevant'
    ]
  },
  row: {
    mustcontain: ['columnheader', 'gridcell', 'rowheader'],
    namefrom: ['contents', 'author'],
    parent: ['group', 'widget'],
    properties: ['aria-level', 'aria-selected'],
    scope: ['grid', 'rowgroup', 'treegrid']
  },
  rowgroup: {
    mustcontain: ['row'],
    namefrom: ['contents', 'author'],
    parent: ['group'],
    scope: ['grid']
  },
  rowheader: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['gridcell', 'sectionhead', 'widget'],
    properties: ['aria-sort'],
    scope: ['row']
  },
  scrollbar: {
    childpresentational: true,
    namefrom: ['author'],
    namerequired: false,
    parent: ['input', 'range'],
    properties: [
      'aria-controls',
      'aria-orientation',
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow'
    ],
    requiredProperties: [
      'aria-controls',
      'aria-orientation',
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow'
    ]
  },
  search: {
    namefrom: ['author'],
    parent: ['landmark']
  },
  section: {
    abstract: true,
    namefrom: ['contents', 'author'],
    parent: ['structure'],
    properties: ['aria-expanded']
  },
  sectionhead: {
    abstract: true,
    namefrom: ['contents', 'author'],
    parent: ['structure'],
    properties: ['aria-expanded']
  },
  select: {
    abstract: true,
    namefrom: ['author'],
    parent: ['composite', 'group', 'input']
  },
  separator: {
    childpresentational: true,
    namefrom: ['author'],
    parent: ['structure'],
    properties: ['aria-expanded', 'aria-orientation']
  },
  slider: {
    childpresentational: true,
    namefrom: ['author'],
    namerequired: true,
    parent: ['input', 'range'],
    properties: [
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow',
      'aria-orientation'
    ],
    requiredProperties: ['aria-valuemax', 'aria-valuemin', 'aria-valuenow']
  },
  spinbutton: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['input', 'range'],
    properties: [
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow',
      'aria-required'
    ],
    requiredProperties: ['aria-valuemax', 'aria-valuemin', 'aria-valuenow']
  },
  status: {
    parent: ['region']
  },
  structure: {
    abstract: true,
    parent: ['roletype']
  },
  tab: {
    namefrom: ['contents', 'author'],
    parent: ['sectionhead', 'widget'],
    properties: ['aria-selected'],
    scope: ['tablist']
  },
  tablist: {
    mustcontain: ['tab'],
    namefrom: ['author'],
    parent: ['composite', 'directory'],
    properties: ['aria-level']
  },
  tabpanel: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['region']
  },
  textbox: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['input'],
    properties: [
      'aria-activedescendant',
      'aria-autocomplete',
      'aria-multiline',
      'aria-readonly',
      'aria-required'
    ]
  },
  timer: {
    namefrom: ['author'],
    namerequired: true,
    parent: ['status']
  },
  toolbar: {
    namefrom: ['author'],
    parent: ['group']
  },
  tooltip: {
    namerequired: true,
    parent: ['section']
  },
  tree: {
    mustcontain: ['group', 'treeitem'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['select'],
    properties: ['aria-multiselectable', 'aria-required']
  },
  treegrid: {
    mustcontain: ['row'],
    namefrom: ['author'],
    namerequired: true,
    parent: ['grid', 'tree']
  },
  treeitem: {
    namefrom: ['contents', 'author'],
    namerequired: true,
    parent: ['listitem', 'option'],
    scope: ['group', 'tree']
  },
  widget: {
    abstract: true,
    parent: ['roletype']
  },
  window: {
    abstract: true,
    namefrom: [' author'],
    parent: ['roletype'],
    properties: ['aria-expanded']
  }
});

export const TAG_TO_IMPLICIT_SEMANTIC_INFO: Readonly<{ [key: string]: any }> = Object.freeze({
  A: [{
    allowed: [
      'button',
      'checkbox',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'tab',
      'treeitem'],
    role: 'link',
    selector: 'a[href]'
  }],
  ADDRESS: [{
    allowed: [
      'contentinfo',
      'presentation'],
    role: ''
  }],
  AREA: [{
    role: 'link',
    selector: 'area[href]'
  }],
  ARTICLE: [{
    allowed: [
      'presentation',
      'article',
      'document',
      'application',
      'main'
    ],
    role: 'article'
  }],
  ASIDE: [{
    allowed: [
      'note',
      'complementary',
      'search',
      'presentation'
    ],
    role: 'complementary'
  }],
  AUDIO: [{
    allowed: ['application', 'presentation'],
    role: ''
  }],
  BASE: [{
    reserved: true,
    role: ''
  }],
  BLOCKQUOTE: [{
    allowed: ['*'],
    role: ''
  }],
  BODY: [{
    allowed: ['presentation'],
    role: 'document'
  }],
  BUTTON: [{
    allowed: [
      'link',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'radio'],
    role: 'button',
    selector: 'button:not([aria-pressed]):not([type="menu"])'
  }, {
    allowed: ['button'],
    role: 'button',
    selector: 'button[aria-pressed]'
  }, {
    allowed: [
      'link',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'radio'],
    attributes: {
      'aria-haspopup': true
    },
    role: 'button',
    selector: 'button[type="menu"]'
  }],
  CAPTION: [{
    allowed: ['presentation'],
    role: ''
  }],
  COL: [{
    reserved: true,
    role: ''
  }],
  COLGROUP: [{
    reserved: true,
    role: ''
  }],
  DATALIST: [{
    allowed: ['presentation'],
    attributes: {
      'aria-multiselectable': false
    },
    role: 'listbox'
  }],
  DD: [{
    allowed: ['presentation'],
    role: ''
  }],
  DEL: [{
    allowed: ['*'],
    role: ''
  }],
  DETAILS: [{
    allowed: [
      'group',
      'presentation'],
    role: 'group'
  }],
  DIALOG: [{ // updated 'allowed' from: http://www.w3.org/html/wg/drafts/html/master/interactive-elements.html#the-dialog-element
    allowed: ['dialog', 'alert', 'alertdialog', 'application', 'log', 'marquee', 'status'],
    role: 'dialog',
    selector: 'dialog[open]'
  }, {
    allowed: ['dialog', 'alert', 'alertdialog', 'application', 'log', 'marquee', 'status'],
    attributes: {
      'aria-hidden': true
    },
    role: 'dialog',
    selector: 'dialog:not([open])'
  }],
  DIV: [{
    allowed: ['*'],
    role: ''
  }],
  DL: [{
    allowed: ['presentation'],
    role: 'list'
  }],
  DT: [{
    allowed: ['presentation'],
    role: ''
  }],
  EMBED: [{
    allowed: [
      'application',
      'document',
      'img',
      'presentation'],
    role: ''
  }],
  FIGURE: [{
    allowed: ['*'],
    role: ''
  }],
  FOOTER: [{
    allowed: ['contentinfo', 'presentation'],
    role: ''
  }],
  FORM: [{
    allowed: ['presentation'],
    role: 'form'
  }],
  H1: [{
    role: 'heading'
  }],
  H2: [{
    role: 'heading'
  }],
  H3: [{
    role: 'heading'
  }],
  H4: [{
    role: 'heading'
  }],
  H5: [{
    role: 'heading'
  }],
  H6: [{
    role: 'heading'
  }],
  HEAD: [{
    reserved: true,
    role: ''
  }],
  HEADER: [{
    allowed: [
      'banner',
      'presentation'
    ],
    role: ''
  }],
  HR: [{
    allowed: ['presentation'],
    role: 'separator'
  }],
  HTML: [{
    reserved: true,
    role: ''
  }],
  IFRAME: [{
    allowed: [
      'application',
      'document',
      'img',
      'presentation'
    ],
    role: '',
    selector: 'iframe:not([seamless])'
  }, {
    allowed: [
      'application',
      'document',
      'img',
      'presentation',
      'group'
    ],
    role: '',
    selector: 'iframe[seamless]'
  }],
  IMG: [{
    reserved: true,
    role: 'presentation',
    selector: 'img[alt=""]'
  }, {
    allowed: ['*'],
    role: 'img',
    selector: 'img[alt]:not([alt=""])'
  }],
  INPUT: [{
    allowed: [
      'link',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'radio'
    ],
    role: 'button',
    selector: 'input[type="button"]:not([aria-pressed])'
  }, {
    allowed: ['button'],
    role: 'button',
    selector: 'input[type="button"][aria-pressed]'
  }, {
    allowed: ['checkbox'],
    role: 'checkbox',
    selector: 'input[type="checkbox"]'
  }, {
    role: '',
    selector: 'input[type="color"]'
  }, {
    role: '',
    selector: 'input[type="date"]'
  }, {
    role: '',
    selector: 'input[type="datetime"]'
  }, {
    role: 'textbox',
    selector: 'input[type="email"]:not([list])'
  }, {
    role: '',
    selector: 'input[type="file"]'
  }, {
    reserved: true,
    role: '',
    selector: 'input[type="hidden"]'
  }, {
    allowed: ['button'],
    role: 'button',
    selector: 'input[type="image"][aria-pressed]'
  }, {
    allowed: [
      'link',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'radio'
    ],
    role: 'button',
    selector: 'input[type="image"]:not([aria-pressed])'
  }, {
    role: '',
    selector: 'input[type="month"]'
  }, {
    role: '',
    selector: 'input[type="number"]'
  }, {
    role: 'textbox',
    selector: 'input[type="password"]'
  }, {
    allowed: ['menuitemradio'],
    role: 'radio',
    selector: 'input[type="radio"]'
  }, {
    role: 'slider',
    selector: 'input[type="range"]'
  }, {
    role: 'button',
    selector: 'input[type="reset"]'
  }, {
    role: 'combobox', // aria-owns is set to the same value as the list attribute
    selector: 'input[type="search"][list]'
  }, {
    role: 'textbox',
    selector: 'input[type="search"]:not([list])'
  }, {
    role: 'button',
    selector: 'input[type="submit"]'
  }, {
    role: 'combobox', // aria-owns is set to the same value as the list attribute
    selector: 'input[type="tel"][list]'
  }, {
    role: 'textbox',
    selector: 'input[type="tel"]:not([list])'
  }, {
    role: 'combobox', // aria-owns is set to the same value as the list attribute
    selector: 'input[type="text"][list]'
  }, {
    role: 'textbox',
    selector: 'input[type="text"]:not([list])'
  }, {
    role: 'textbox',
    selector: 'input:not([type])'
  }, {
    role: '',
    selector: 'input[type="time"]'
  }, {
    role: 'combobox', // aria-owns is set to the same value as the list attribute
    selector: 'input[type="url"][list]'
  }, {
    role: 'textbox',
    selector: 'input[type="url"]:not([list])'
  }, {
    role: '',
    selector: 'input[type="week"]'
  }],
  INS: [{
    allowed: ['*'],
    role: ''
  }],
  KEYGEN: [{
    role: ''
  }],
  LABEL: [{
    allowed: ['presentation'],
    role: ''
  }],
  LI: [{
    allowed: [
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'option',
      'tab',
      'treeitem',
      'presentation'
    ],
    role: 'listitem',
    selector: 'ol:not([role="presentation"])>li, ul:not([role="presentation"])>li'
  }, {
    allowed: [
      'listitem',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'option',
      'tab',
      'treeitem',
      'presentation'
    ],
    role: 'listitem',
    selector: 'ol[role="presentation"]>li, ul[role="presentation"]>li'
  }],
  LINK: [{
    reserved: true,
    role: 'link',
    selector: 'link[href]'
  }],
  MAIN: [{
    allowed: [
      'main',
      'presentation'
    ],
    role: ''
  }],
  MAP: [{
    reserved: true,
    role: ''
  }],
  MATH: [{
    allowed: ['presentation'],
    role: ''
  }],
  MENU: [{
    role: 'toolbar',
    selector: 'menu[type="toolbar"]'
  }],
  MENUITEM: [{
    role: 'menuitem',
    selector: 'menuitem[type="command"]'
  }, {
    role: 'menuitemcheckbox',
    selector: 'menuitem[type="checkbox"]'
  }, {
    role: 'menuitemradio',
    selector: 'menuitem[type="radio"]'
  }],
  META: [{
    reserved: true,
    role: ''
  }],
  METER: [{
    allowed: ['presentation'],
    role: 'progressbar'
  }],
  NAV: [{
    allowed: ['navigation', 'presentation'],
    role: 'navigation'
  }],
  NOSCRIPT: [{
    reserved: true,
    role: ''
  }],
  OBJECT: [{
    allowed: ['application', 'document', 'img', 'presentation'],
    role: ''
  }],
  OL: [{
    allowed: ['directory', 'group', 'listbox', 'menu', 'menubar', 'tablist', 'toolbar', 'tree', 'presentation'],
    role: 'list'
  }],
  OPTGROUP: [{
    allowed: ['presentation'],
    role: ''
  }],
  OPTION: [{
    role: 'option'
  }],
  OUTPUT: [{
    allowed: ['*'],
    role: 'status'
  }],
  P: [{
    allowed: ['*'],
    role: ''
  }],
  PARAM: [{
    reserved: true,
    role: ''
  }],
  PICTURE: [{
    reserved: true,
    role: ''
  }],
  PRE: [{
    allowed: ['*'],
    role: ''
  }],
  PROGRESS: [{
    allowed: ['presentation'],
    role: 'progressbar'
  }],
  SCRIPT: [{
    reserved: true,
    role: ''
  }],
  SECTION: [{
    allowed: [
      'alert',
      'alertdialog',
      'application',
      'banner',
      'contentinfo',
      'complementary',
      'contentinfo',
      'dialog',
      'document',
      'feed',
      'log',
      'main',
      'marquee',
      'navigation',
      'search',
      'status',
      'tabpanel'
    ],
    role: 'region'
  }],
  SELECT: [{
    role: 'listbox'
  }],
  SOURCE: [{
    reserved: true,
    role: ''
  }],
  SPAN: [{
    allowed: ['*'],
    role: ''
  }],
  STYLE: [{
    reserved: true,
    role: ''
  }],
  SUMMARY: [{
    allowed: ['presentation'],
    role: ''
  }],
  SVG: [{
    allowed: [
      'application',
      'document',
      'img',
      'presentation'
    ],
    role: ''
  }],
  TABLE: [{
    allowed: ['*'],
    role: ''
  }],
  TBODY: [{
    allowed: ['*'],
    role: 'rowgroup'
  }],
  TD: [{
    allowed: ['*'],
    role: ''
  }],
  TEMPLATE: [{
    reserved: true,
    role: ''
  }],
  TEXTAREA: [{
    role: 'textbox'
  }],
  TFOOT: [{
    allowed: ['*'],
    role: 'rowgroup'
  }],
  TH: [{
    allowed: ['*'],
    role: ''
  }],
  THEAD: [{
    allowed: ['*'],
    role: 'rowgroup'
  }],
  TITLE: [{
    reserved: true,
    role: ''
  }],
  TR: [{
    allowed: ['*'],
    role: ''
  }],
  TRACK: [{
    reserved: true,
    role: ''
  }],
  UL: [{
    allowed: [
      'directory',
      'group',
      'listbox',
      'menu',
      'menubar',
      'presentation',
      'tablist',
      'toolbar',
      'tree'
    ],
    role: 'list'
  }],
  VIDEO: [{
    allowed: ['application', 'presentation'],
    role: ''
  }]
});
