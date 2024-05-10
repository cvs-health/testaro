/*
  © 2024 CVS Health and/or one of its affiliates. All rights reserved.

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

// device

// IMPORTS

const {devices} = require('playwright');

// FUNCTIONS

// Returns whether a device ID is valid.
exports.isDeviceID = deviceID => !! devices[deviceID];

// Returns options for the browser.newContext() function.
exports.getDeviceOptions = (deviceID, motion) => {
  const options = {
    reduceMotion: motion
  };
  // If a non-default device was specified:
  if (deviceID && deviceID !== 'default') {
    // Get its properties if it exists.
    const deviceProperties = devices[deviceID];
    // Return options or report the device as invalid.
    if (deviceProperties) {
      return {
        ... options,
        ... deviceProperties
      };
    }
    else {
      return {};
    }
  }
  // Otherwise, i.e. if no non-default device was specified:
  else {
    // Return options.
    return options;
  }
};
