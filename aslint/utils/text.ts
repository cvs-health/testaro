import { ObjectUtility } from './object';

// Note: safeTrim related constants

const SP: string = ' ';
const TAB: string = '\t';
const CR: string = '\r';
const LF: string = '\n';
const CR_LF = '\r\n';
const FF: string = '\f';
const ZERO_WIDTH_SPACE: string = '\v' + // \x0B VT 垂直制表符
  '\f' + //  \x0C FF 换页符
  '\u200B\u200C\u200D\u200E\u200F\u000b\u2028\u2029\uFEFF\u202D';
const OTHER_SPACE: string = '\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000';

const ALL_SPACES: string = SP + TAB + CR + LF + CR_LF + ZERO_WIDTH_SPACE + OTHER_SPACE;

const leftReg: RegExp = new RegExp(`^[${ALL_SPACES}]+`);
const rightReg: RegExp = new RegExp(`[${ALL_SPACES}]+$`);
const zeroReg: RegExp = new RegExp(`[${ZERO_WIDTH_SPACE}]+`, 'g');
const otherReg: RegExp = new RegExp(`[${OTHER_SPACE}]+`, 'g');
const space: RegExp = new RegExp(`^[${SP+TAB+LF+FF+CR}]+$`);
const allWhiteSpaces: RegExp = new RegExp(`[${TAB + CR + LF + CR_LF + ZERO_WIDTH_SPACE + OTHER_SPACE}]`, 'g');

export class TextUtility {
  private static isNativeTrimAvailable: boolean = String.prototype.trim && ObjectUtility.isNativeMethod(String.prototype.trim);
  private static escapeEntityMap: { [key: string]: string } = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#39;',
    '/': '&#x2F;',
    '<': '&lt;',
    '=': '&#x3D;',
    '>': '&gt;',
    '`': '&#x60;'
  };

  private static unescapeEntityMap: { [key: string]: string } = {
    '&#39;': '\'',
    '&#x2F;': '/',
    '&#x3D;': '=',
    '&#x60;': '`',
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"'
  };

  public static trim(text: string): string {
    if (TextUtility.isNativeTrimAvailable) {
      return text.trim();
    }

    return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

  public static truncateWords(str: string, numberOfChars?: number): string {
    const amount: number = numberOfChars ? numberOfChars : 50;
    const cut: number = str.indexOf(' ', amount);

    if (cut === -1) {
      return str;
    }

    return `${str.substring(0, cut)} [...]`;
  }

  public static truncate(str: string, numberOfChars?: number): string {
    const amount: number = numberOfChars ? numberOfChars : 50;

    return `${str.substring(0, amount)} [...]`;
  }

  public static truncateInTheMiddle(text: string, startChars?: number, endChars?: number, maxLength?: number): string {
    let start: any;
    let end: any;
    const charsAtTheBeginning: number = startChars || 70;
    const charsAtTheEnd: number = endChars || 70;
    const maximumLength: number = maxLength || 120;
    const content: string = text.trim();

    if (content.length > maximumLength) {
      start = content.substring(0, charsAtTheBeginning);
      end = content.substring(content.length - charsAtTheEnd, content.length);

      return `${start} [...] ${end}`;
    }

    return text;
  }

  public static isUpperCase(str: string): boolean {
    if ((/[^\w]/).test(str)) {
      return false;
    }

    if (isNaN(Number(str)) && str.length > 1) {
      return str === str.toUpperCase();
    }

    return false;
  }

  public static containsOnlyWhiteSpaces(str: string): boolean {
    return (/^\s*$/).test(str);
  }

  // Note: following by https://www.w3.org/TR/2010/WD-html-markup-20100624/terminology.html#space
  public static containsSpaceCharacter(str: string): boolean {
    return space.test(str);
  }

  public static safeTrim(string: string): string {
    return string
      .replace(leftReg, '')
      .replace(rightReg, '')
      .replace(new RegExp(TAB, 'g'), '')
      .replace(new RegExp(CR_LF, 'g'), LF)
      .replace(new RegExp(CR, 'g'), LF)
      .replace(zeroReg, '')
      .replace(otherReg, '')
      .trim();
  }

  public static normalizeWhitespaces(string: string): string {
    return string
      .replace(allWhiteSpaces, ' ').replace(/\s+/g, ' ');
  }

  public static escape(str: string): string {
    const fromEntityMap: any = (s: any): string => {
      return this.escapeEntityMap[s];
    };

    return String(str).replace(/[&<>"'`=/]/g, fromEntityMap);
  }

  public static unescape(str: string): string {
    const fromEntityMap: any = (s: any): string => {
      return this.unescapeEntityMap[s];
    };

    return String(str).replace(/&([^;]+);/g, fromEntityMap);
  }

  public static convertUnderscoresToDashes(text: string): string {
    return text.replace(/_/g, '-');
  }

  public static convertDashesToUnderscores(text: string): string {
    return text.replace(/-/g, '_');
  }

  public static replacePlaceholder(text: string, words: string[], placeholder: string = '%'): string {
    const replaceValue = (result: string, value: string, i: number): string => {
      return result.replace(`${placeholder}${i}`, String(value));
    };

    return words.reduce(replaceValue, text);
  }

  public static areStringsTheSame(str1: string, str2: string): boolean {
    return str1.toLocaleUpperCase() === str2.toLocaleUpperCase();
  }
}
