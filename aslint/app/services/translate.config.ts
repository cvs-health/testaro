import english from '../../dist/translations/en-us.json';

export const Translations: { [key: string]: any } = {
  [english._config.locale]: english
};

export const DefaultLocale: string = english._config.locale;
