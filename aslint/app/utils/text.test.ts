import { DomUtility } from './dom';
import { TextUtility } from './text';

describe('Utils', () => {

  describe('TextUtility', () => {

    it('should indicate that class exists', () => {
      const textUtility = new TextUtility();

      expect(textUtility).toBeDefined();
    });

    describe('#truncateWords', () => {

      it('should truncate words', () => {
        const str: string = 'This is just a sample text',
          strAfter: string = TextUtility.truncateWords(str, 1),
          DOTS: number = 6;

        expect(strAfter.length).toBe(4 + DOTS);
      });

      it('should not truncate words if there is only one word', () => {
        const str: string = 'Thisisanexample',
          strAfter: string = TextUtility.truncateWords(str, 1),
          DOTS: number = 6;

        expect(strAfter.length).toBe(9 + DOTS);
      });

      it('should truncate words to default amounts', () => {
        const str: string = 'This is just a sample text. This is just a sample text. This is just a sample text. ' +
          'This is just a sample text. This is just a sample text. ' +
          'This is just a sample text. This is just a sample text.',
          strAfter: string = TextUtility.truncateWords(str),
          DOTS: number = 6;

        expect(strAfter.length).toBe(55 + DOTS);
      });

    });

    describe('#truncate', () => {

      it('should truncate string to specified number of characters', () => {
        const str: string = 'This is just a sample text',
          strAfter: string = TextUtility.truncate(str, 5),
          DOTS: number = 6;

        expect(strAfter.length).toBe(5 + DOTS);
      });

      it('should truncate string to default number of characters', () => {
        const str = 'This is just a sample text. This is just a sample text. ' +
          'This is just a sample text. This is just a sample text. ' +
          'This is just a sample text. This is just a sample text. This is just a sample text.',
          strAfter: string = TextUtility.truncate(str),
          DOTS: number = 6;

        expect(strAfter.length).toBe(50 + DOTS);
      });

    });

    describe('#truncateInTheMiddle', () => {

      it('should truncate middle content using default parameters', () => {
        const str: string = 'Dinosaurs are a diverse group of reptiles of the clade Dinosauria ' +
          'that first appeared during the Triassic. Although the exact origin and timing of the ' +
          'evolution of dinosaurs is the subject of active research,[1] the current scientific ' +
          'consensus places their origin between 231 and 243 million years ago.[2] ' +
          'They became the dominant terrestrial vertebrates after the Triassic–Jurassic ' +
          'extinction event 201 million years ago. Their dominance continued through the ' +
          'Jurassic and Cretaceous periods and ended when the Cretaceous–Paleogene extinction ' +
          'event led to the extinction of most dinosaur groups 66 million years ago.';

        expect(TextUtility.truncateInTheMiddle(str)).toBe('Dinosaurs are a diverse group of reptiles of the clade Dinosauria that [...] nt led to the extinction of most dinosaur groups 66 million years ago.');
      });

      it('should truncate middle content using custom parameters', () => {
        const str: string = 'Dinosaurs are a diverse group of reptiles of the clade Dinosauria that first appeared ' +
          'during the Triassic. Although the exact origin and timing of the evolution of dinosaurs is the ' +
          'subject of active research,[1] the current scientific consensus places their origin between 231 ' +
          'and 243 million years ago.[2] They became the dominant terrestrial vertebrates after the Triassic–Jurassic ' +
          'extinction event 201 million years ago. Their dominance continued through the Jurassic and Cretaceous ' +
          'periods and ended when the Cretaceous–Paleogene extinction event led to the extinction of most ' +
          'dinosaur groups 66 million years ago.';

        expect(TextUtility.truncateInTheMiddle(str, 5, 5, 30)).toBe('Dinos [...]  ago.');
      });

      it('should truncate middle node outerHTML content using default parameters', () => {
        const node = document.createElement('area');

        node.coords = '0,0,82,126';
        node.href = 'sun.htm';
        node.shape = 'rect';

        document.documentElement.appendChild(node);

        expect(TextUtility.truncateInTheMiddle(DomUtility.getNodeHTML(node)))
          .toBe('<area coords="0,0,82,126" href="sun.htm" shape="rect">');

        node.remove();
      });

      const text = 'Florence Cathedral, formally the Cattedrale di Santa Maria del Fiore, is a basilica in Florence, Italy. It was begun in 1296 in the Gothic style to a design of Arnolfo di Cambio, and was structurally completed by 1436, with the dome designed by Filippo Brunelleschi. The exterior of the cathedral is faced with polychrome marble panels in various shades of green and pink, bordered by white, and has an elaborate 19th-century Gothic Revival facade by Emilio De Fabris.';

      it('should return truncated in the middle text with default parameters', () => {
        expect(TextUtility.truncateInTheMiddle(text)).toEqual('Florence Cathedral, formally the Cattedrale di Santa Maria del Fiore,  [...] s an elaborate 19th-century Gothic Revival facade by Emilio De Fabris.');
      });

      it('should return truncated in the middle text with 5 chars at the start', () => {
        expect(TextUtility.truncateInTheMiddle(text, 5)).toEqual('Flore [...] s an elaborate 19th-century Gothic Revival facade by Emilio De Fabris.');
      });

      it('should return truncated in the middle text with 5 chars at the end', () => {
        expect(TextUtility.truncateInTheMiddle(text, 0, 5)).toEqual('Florence Cathedral, formally the Cattedrale di Santa Maria del Fiore,  [...] bris.');
      });

      it('should return truncated in the middle text with 5 chars in the end and maxLength parameter higher than text length', () => {
        expect(TextUtility.truncateInTheMiddle(text, 0, 5, 10)).toEqual('Florence Cathedral, formally the Cattedrale di Santa Maria del Fiore,  [...] bris.');
      });

      it('should return truncated in the middle text with 5 chars in the end and maxLength parameter lower than text length', () => {
        expect(TextUtility.truncateInTheMiddle('shorttext', 0, 5, 10)).toEqual('shorttext');
      });

      it('should return truncated in the middle text with 5 chars in the end and maxLength parameter lower than text length after trim', () => {
        expect(TextUtility.truncateInTheMiddle('    shorttext.      \n\r', 0, 5, 10)).toEqual('    shorttext.      \n\r');
      });

      it('should return truncated in the middle text with 20 chars at start, 99 chars at end, 33 maximum length', () => {
        expect(TextUtility.truncateInTheMiddle(text, 20, 99, 33)).toEqual('Florence Cathedral,  [...] nk, bordered by white, and has an elaborate 19th-century Gothic Revival facade by Emilio De Fabris.');
      });
    });

    describe('#containsOnlyWhiteSpaces', () => {

      it('should determine that the given string contains only white spaces', () => {
        expect(TextUtility.containsOnlyWhiteSpaces('\t\r\n\v\f')).toBe(true);
        expect(TextUtility.containsOnlyWhiteSpaces('')).toBe(true);
        expect(TextUtility.containsOnlyWhiteSpaces(' ')).toBe(true);
        expect(TextUtility.containsOnlyWhiteSpaces('\n')).toBe(true);
        expect(TextUtility.containsOnlyWhiteSpaces('\r  ')).toBe(true);
      });

      it('should determine that the given string contains not only white spaces', () => {
        expect(TextUtility.containsOnlyWhiteSpaces('   s ')).toBe(false);
        expect(TextUtility.containsOnlyWhiteSpaces('    a')).toBe(false);
        expect(TextUtility.containsOnlyWhiteSpaces('1    ')).toBe(false);
        expect(TextUtility.containsOnlyWhiteSpaces('hello')).toBe(false);
      });
    });

    describe('#containsSpaceCharacter', () => {

      it('should determine that the given string contains space character', () => {
        expect(TextUtility.containsSpaceCharacter(' \t\n\f\r')).toBe(true);
      });

    });

    describe('#safeTrim', () => {
      it('should trim all known whitespaces', () => {
        expect(TextUtility.safeTrim('\t\r\n\v\f\u200B\u200C\u200D\u200E\u200F\u000b\u2028\u2029\uFEFF\u202D\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000').length).toBe(0);
      });
    });

    describe('#normalizeWhitespaces', () => {
      it('should replace all new lines with a single white space', () => {
        expect(TextUtility.normalizeWhitespaces('click\nhere')).toBe('click here');
      });

      it('should replace all known whitespaces with a single white space', () => {
        expect(TextUtility.normalizeWhitespaces(`click\t\r\n\v\f\u200B\u200C\u200D\u200E\u200F\u000b\u2028\u2029\uFEFF\u202D\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000here`)).toBe('click here');
      });

      it('should replace zero width space with regular space', () => {
        const zeroWidthSpace: string = String.fromCharCode(8203);

        expect(TextUtility.normalizeWhitespaces(`click${zeroWidthSpace}here`)).toBe('click here');
      });
    });

    describe('#isUpperCase', () => {

      it('should return true for string with capital letters only', () => {
        expect(TextUtility.isUpperCase('TEST')).toBeTruthy();
      });

      it('should return false for string with mixed with capital and lower letters', () => {
        const str: string = 'TEst';

        expect(TextUtility.isUpperCase(str)).toBeFalsy();
      });

      it('should return false for string that contains non-letters and non-numbers only', () => {
        const exampleString: Array<number> = [124, 160, 10, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 160, 124];
        let str: string = '';
        let i: number;

        for (i = 0; i < exampleString.length; i += 1) {
          str += String.fromCharCode(exampleString[i]);
        }

        expect(TextUtility.isUpperCase(str)).toBeFalsy();
      });

    });

    describe('#escape', () => {
      const expectedText: string = '&lt;a href&#x3D;&quot;#&quot;&gt;test&amp;test&#39;&lt;&#x2F;a&gt;';

      it('escapes &<>"\'/', () => {
        expect(TextUtility.escape('<a href="#">test&test\'</a>')).toBe(expectedText);
      });

      it('should return string with escaped characters', (): void => {
        expect(TextUtility.escape('&<>"/`=')).toBe('&amp;&lt;&gt;&quot;&#x2F;&#x60;&#x3D;');
        expect(TextUtility.escape('test@#$%^*()_-+~\\|}{][;:?.,')).toBe('test@#$%^*()_-+~\\|}{][;:?.,');
      });

    });

    describe('#convertUnderscoresToDashes', () => {

      it('should convert all underscores to dashes for provided string', () => {
        expect(TextUtility.convertUnderscoresToDashes('this_is_an_example')).toBe('this-is-an-example');
        expect(TextUtility.convertUnderscoresToDashes('this-is_an*example')).toBe('this-is-an*example');
        expect(TextUtility.convertUnderscoresToDashes('this-is_an__example')).toBe('this-is-an--example');
      });

    });

    describe('#convertDashesToUnderscores', () => {

      it('should convert all dashes to underscores for provided string', () => {
        expect(TextUtility.convertDashesToUnderscores('this-is-an-example')).toBe('this_is_an_example');
        expect(TextUtility.convertDashesToUnderscores('this-is-an*example')).toBe('this_is_an*example');
        expect(TextUtility.convertDashesToUnderscores('this-is-an--example')).toBe('this_is_an__example');
      });

    });

    describe('#replacePlaceholder', () => {
      it('should replace with default placeholder', () => {
        expect(TextUtility.replacePlaceholder('ab=%0, c=%1', ['1', '2'])).toEqual('ab=1, c=2');
      });

      it('should replace with custom placeholder', () => {
        expect(TextUtility.replacePlaceholder('ab=$0, c=$1', ['1', '2'], '$')).toEqual('ab=1, c=2');
      });
    });


    describe('#areStringsTheSame', () => {
      it('should determine that given 2 strings are the same', () => {
        expect(TextUtility.areStringsTheSame('a', 'a')).toBeTruthy();
        expect(TextUtility.areStringsTheSame('EXAMPLE', 'example')).toBeTruthy();
      });

      it('should determine that given 2 strings are not the same', () => {
        expect(TextUtility.areStringsTheSame('a', 'á')).toBeFalsy();
      });
    });

  });
});
