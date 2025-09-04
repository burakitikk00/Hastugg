import { useState, useCallback } from 'react';

const useImageLoading = () => {
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [errorImages, setErrorImages] = useState(new Set());

  const handleImageLoad = useCallback((imageSrc) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageSrc);
      return newSet;
    });
    setLoadedImages(prev => new Set(prev).add(imageSrc));
  }, []);

  const handleImageError = useCallback((imageSrc) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageSrc);
      return newSet;
    });
    setErrorImages(prev => new Set(prev).add(imageSrc));
  }, []);

  const startImageLoading = useCallback((imageSrc) => {
    setLoadingImages(prev => new Set(prev).add(imageSrc));
  }, []);

  const isImageLoading = useCallback((imageSrc) => {
    return loadingImages.has(imageSrc);
  }, [loadingImages]);

  const isImageLoaded = useCallback((imageSrc) => {
    return loadedImages.has(imageSrc);
  }, [loadedImages]);

  const isImageError = useCallback((imageSrc) => {
    return errorImages.has(imageSrc);
  }, [errorImages]);

  return {
    isImageLoading,
    isImageLoaded,
    isImageError,
    handleImageLoad,
    handleImageError,
    startImageLoading
  };
};

export default useImageLoading;
