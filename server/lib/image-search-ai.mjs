const PLACEHOLDER_IMAGE = '/no-image.png';

export async function searchForProductImage({
  name,
  brand,
  currentImage,
  category,
} = {}) {
  if (currentImage) {
    return {
      primaryImageUrl: currentImage,
      gallery: [currentImage],
    };
  }

  const hints = [name, brand, category].filter(Boolean).join(' ');

  return {
    primaryImageUrl: PLACEHOLDER_IMAGE,
    gallery: [PLACEHOLDER_IMAGE],
    hints,
  };
}

