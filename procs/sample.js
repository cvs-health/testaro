/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

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
  sample
  Draws a decreasingly index-weighted random sample.
*/

// FUNCTIONS

// Draws a location-weighted sample.
exports.getSample = (population, sampleSize) => {
  const popSize = population.length;
  // If the sample is smaller than the population:
  if (sampleSize < popSize) {
    // Assign to each individual a priority randomly decreasing with its index.
    const WeightedPopulation = population.map((item, index) => {
      const weight = 1 + Math.sin(Math.PI * index / popSize + Math.PI / 2);
      const priority = weight * Math.random();
      return [index, priority];
    });
    // Return the population indexes of the items in the sample, in ascending order.
    const sortedPopulation = WeightedPopulation.sort((a, b) => b[1] - a[1]);
    const sample = sortedPopulation.slice(0, sampleSize);
    const domOrderSample = sample.sort((a, b) => a[0] - b[0]);
    return domOrderSample.map(individual => individual[0]);
  }
  // Otherwise, i.e. if the sample is at least as large as the population:
  else {
    // Return the population indexes.
    return population.map((item, index) => index);
  }
};
