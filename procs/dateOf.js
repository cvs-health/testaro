/*
  © 2024 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  dateOf
  Returns the date represented by a time stamp.
*/

// Inserts a character periodically in a string.
const punctuate = (string, insertion, chunkSize) => {
  const segments = [];
  let startIndex = 0;
  while (startIndex < string.length) {
    segments.push(string.slice(startIndex, startIndex + chunkSize));
    startIndex += chunkSize;
  }
  return segments.join(insertion);
};
// Gets the date of a timestamp.
exports.dateOf = timeStamp => {
  if (/^\d{6}T\d{4}$/.test(timeStamp)) {
    const dateString = punctuate(timeStamp.slice(0, 6), '-', 2);
    const timeString = punctuate(timeStamp.slice(7, 11), ':', 2);
    return new Date(`20${dateString}T${timeString}Z`);
  } else {
    return null;
  }
};
