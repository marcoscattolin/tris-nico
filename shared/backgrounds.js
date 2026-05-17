const BACKGROUNDS = [
  'linear-gradient(135deg, #0f172a, #1e293b)',
  'linear-gradient(135deg, #1e3a8a, #6d28d9)',
  'linear-gradient(135deg, #831843, #4c1d95)',
  'linear-gradient(135deg, #064e3b, #0f766e)',
  'linear-gradient(135deg, #7c2d12, #b45309)',
  'linear-gradient(135deg, #134e4a, #1e3a8a)',
  'linear-gradient(135deg, #500724, #831843)',
  'linear-gradient(135deg, #1f2937, #4338ca)',
  'linear-gradient(135deg, #052e16, #166534)',
  'linear-gradient(135deg, #422006, #92400e)',
  'linear-gradient(135deg, #3b0764, #0c4a6e)',
  'linear-gradient(135deg, #0c4a6e, #134e4a)'
];

let lastBgIndex = -1;

export function changeBackground() {
  let idx;
  do {
    idx = Math.floor(Math.random() * BACKGROUNDS.length);
  } while (idx === lastBgIndex && BACKGROUNDS.length > 1);
  lastBgIndex = idx;
  document.body.style.background = BACKGROUNDS[idx];
}
