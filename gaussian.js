// chatgpt cooked this up --  does it even work?

/**
 * Generate a discrete Gaussian PDF with a fixed number of bins.
 *
 * @param {number} bins    - Number of bins (integer > 0)
 * @param {number} mean    - Gaussian mean (default 0)
 * @param {number} std     - Gaussian standard deviation (default 1). If std === 0, a delta-like distribution is returned.
 * @param {Array|null} range - Optional [min, max] range to cover. If null, uses mean +/- 4*std.
 * @returns {number[]} Array of length `bins` containing probabilities summing to 1.
 */
function discreteGaussianPDF(bins, mean = 0, std = 1, range = null) {
    if (!Number.isInteger(bins) || bins <= 0) throw new Error('bins must be a positive integer');
    if (std < 0) throw new Error('std must be non-negative');
  
    // If std = 0, put all mass into the bin whose center is closest to mean
    if (std === 0) {
      // define a default range if none provided so we can find bin index
      const defaultRange = range || [mean - 0.5, mean + 0.5];
      const [min, max] = defaultRange;
      const width = (max - min) / bins;
      const centers = new Array(bins).fill(0).map((_, i) => min + (i + 0.5) * width);
      // find index of center closest to mean
      let best = 0;
      let bestDist = Math.abs(centers[0] - mean);
      for (let i = 1; i < centers.length; i++) {
        const d = Math.abs(centers[i] - mean);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      const out = new Array(bins).fill(0);
      out[best] = 1;
      return out;
    }
  
    // Determine the sampling range
    let min, max;
    if (range && Array.isArray(range) && range.length === 2) {
      [min, max] = range;
      if (!(min < max)) throw new Error('range must satisfy min < max');
    } else {
      // default to mean ± 4*std
      min = mean - 4 * std;
      max = mean + 4 * std;
    }
  
    const width = (max - min) / bins;
    const sqrt2pi = Math.sqrt(2 * Math.PI);
    const var2 = 2 * std * std;
  
    // Evaluate PDF at the center of each bin (x_i = min + (i+0.5)*width)
    const vals = new Array(bins);
    let sum = 0;
    for (let i = 0; i < bins; i++) {
      const x = min + (i + 0.5) * width;
      const exponent = -((x - mean) * (x - mean)) / var2;
      const density = (1 / (std * sqrt2pi)) * Math.exp(exponent);
      vals[i] = density;
      sum += density;
    }
  
    // Convert densities to discrete probabilities by normalizing (so they sum to 1)
    if (sum === 0) {
      // Numerical corner case: spread everything evenly
      return new Array(bins).fill(1 / bins);
    } else {
      return vals.map(v => v / sum);
    }
  }