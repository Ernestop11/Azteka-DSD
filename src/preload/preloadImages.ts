const imageCache = new Set<string>();

export const preloadImage = (src: string) => {
  if (imageCache.has(src)) return;
  const img = new Image();
  img.src = src;
  imageCache.add(src);
};

export const preloadImages = (sources: string[]) => {
  sources.forEach(preloadImage);
};
