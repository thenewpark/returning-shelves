export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
