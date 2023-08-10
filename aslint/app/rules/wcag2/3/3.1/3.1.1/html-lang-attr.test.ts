import { HtmlLangAttr } from './html-lang-attr';
import { Validator } from '../../../../../validator';
import { DomUtility } from '../../../../../utils/dom';

describe('Rules', () => {

  describe('HtmlLangAttr#', () => {

    new HtmlLangAttr().registerValidator();

    it('should return one report when html lang=""', () => {

      document.documentElement.lang = '';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>lang</code> attribute on the <code>&lt;html lang&#x3D;&quot;&quot;&gt;&lt;&#x2F;html&gt;</code> root element, but the value (<code></code>) is empty.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('html');
      expect(Validator.getReport('report_0').ruleId).toBe('html-lang-attr');
    });

    it('should return one report when html lang="   "', () => {

      document.documentElement.lang = '   ';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(1);
      expect(Validator.getReport('report_0').message).toBe('You have defined <code>lang</code> attribute on the <code>&lt;html lang&#x3D;&quot;   &quot;&gt;&lt;&#x2F;html&gt;</code> root element, but the value (<code>   </code>) is empty.');
      expect(Validator.getReport('report_0').node.nodeName.toLowerCase()).toBe('html');
      expect(Validator.getReport('report_0').ruleId).toBe('html-lang-attr');
    });

    it('should return no report when html lang="en"', () => {

      document.documentElement.lang = 'en';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="bdz"', () => {

      document.documentElement.lang = 'bdz';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="en-GB"', () => {

      document.documentElement.lang = 'en-GB';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="fr-Brai"', () => {

      document.documentElement.lang = 'fr-Brai';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="es-013"', () => {

      document.documentElement.lang = 'es-013';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="ru-Cyrl-BY"', () => {

      document.documentElement.lang = 'ru-Cyrl-BY';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="en-GB-oed"', () => {

      document.documentElement.lang = 'en-GB-oed';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="i-default"', () => {

      document.documentElement.lang = 'i-default';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="sgn-BE-FR"', () => {

      document.documentElement.lang = 'sgn-BE-FR';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="az-Arab-IR"', () => {

      document.documentElement.lang = 'az-Arab-IR';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

    it('should return no report when html lang="de-CH-1996"', () => {

      document.documentElement.lang = 'de-CH-1996';
      Validator.reset();

      const node = DomUtility.getRootElement();

      new HtmlLangAttr(node).validate();

      expect(Object.keys(Validator.getReports()).length).toBe(0);
    });

  });
});
