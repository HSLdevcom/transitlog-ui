/*
 * Converts input to native or web depending on platform
 * svgTranslate(12,34)
 * Native: { translateX: '12', translateY: '34' }
 * Web: { transform: 'translate(12,34)' }
 */
export function svgTranslate(x, y) {
  return {transform: `translate(${x || 0},${y || 0})`};
}
/*
 * Convert size to web or native depending on platform.
 * Firefox (and perhaps some other browsers) don't work
 * when defining height/width like this: <svg height="2rem" .. />
 * but native works that way.
 * svgSize(12,34)
 * Native: { height: 12, width: 34 }
 * Web: { style: { height: 12, width: 34 } }
 */
export function svgSize(height, width) {
  return {
    style: {height, width},
  };
}

export function svgRotate(deg, originX = 0, originY = 0) {
  return {
    style: {
      transform: `rotate(${deg}deg)`,
      transformOrigin: `${originX}px ${originY}px`,
    },
  };
}
