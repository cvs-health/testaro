import { TextUtility } from '../utils/text';
import { Translations, DefaultLocale } from './translate.config';

const TRANSLATIONS_VALUE_PLACEHOLDER = '%';

export class TranslateService {
  private static currentLocale: string = DefaultLocale;

  constructor() { }

  public static setCurrentLocale(locale: string): void {
    if (typeof Translations[locale] !== 'undefined') {
      TranslateService.currentLocale = locale;
    }
  }

  public static getCurrentLocale(): string {
    return TranslateService.currentLocale;
  }

  public static translate(key: string): string {
    const _currentLocale: string = this.getCurrentLocale();

    if (Translations[_currentLocale] && Translations[_currentLocale][key]) {
      return Translations[_currentLocale][key];
    }

    console.warn(`Key not translated at all: ${key}`);

    return key;
  }

  public static convertToStrings = (value: number | string): string => {
    return String(value);
  }

  public static replace(translation: string, words: string | string[] = ''): string {
    const values: string[] = Array.isArray(words) ? words : [words];

    return TextUtility.replacePlaceholder(translation, values, TRANSLATIONS_VALUE_PLACEHOLDER);
  }

  public static instant(key: string, words?: null | string | number | (string | null | number)[]): string {
    const translation: string = this.translate(key);
    let _words: string | string[] = '';

    if (Array.isArray(words)) {
      _words = (words as Array<any>).map(this.convertToStrings.bind(this));
    } else if (typeof words === 'number') {
      _words = String(words);
    } else if (typeof words === 'string') {
      _words = words;
    }

    if (_words.length === 0) {
      return translation;
    }

    return this.replace(translation, _words);
  }
}
