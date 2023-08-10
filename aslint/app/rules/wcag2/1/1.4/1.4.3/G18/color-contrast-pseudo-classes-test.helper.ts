import { DomUtility } from '../../../../../../utils/dom';

export class ColorContrastPseudoClassesTestHelper {
  public static fillInnerHtml(fakeDom: Element, extraStyle: string, testElementId: string): void {
    const backgroundColor = 'white',
      foregroundColor = '#777',
      fontSize = '15pt',
      fontWeight = 'normal';

    DomUtility.createCSS(`
        #${testElementId} {
          background: yellow;
          color: black;
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
        #${testElementId}:hover {
          background: ${backgroundColor};
          color: ${foregroundColor};
          ${extraStyle}
        }
      `);

    fakeDom.innerHTML = `<p id="${testElementId}">Test</p>`;
  }

  public static getRatio(message: string): number {
    const n: RegExpExecArray | null = (/ratio:\D+(\d+\.?\d*):1/g).exec(message);

    if (n === null) {
      return 0;
    }

    return Number(n[1]);
  }
}
