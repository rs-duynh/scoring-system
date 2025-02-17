/* eslint-disable @typescript-eslint/no-var-requires */
const color = require('./color');
const tailwind = require('./shareTailwind');
const widthHeightTailWind = require('./widthHeight');
const lineHeightTailWind = require('./lineHeight');
const backgroundImage = require('./backgroundImage');
const boxShadow = require('./boxShadow');
const zIndex = require('./zIndex');
const spacing = require('./spacing');

module.exports = {
  tailwind,
  widthHeightTailWind,
  lineHeightTailWind,
  color,
  backgroundImage,
  boxShadow,
  zIndex,
  spacing,
};
