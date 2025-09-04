import { useState, useEffect } from 'react';
import useImageLoading from '../../hooks/useImageLoading';

const LoadingImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
  showLoadingSpinner = true,
  blurWhileLoading = true,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
    }
  };

  const imageClasses = `
    ${className}
    ${isLoading && blurWhileLoading ? 'image-loading' : ''}
    ${hasError ? 'image-error' : ''}
  `.trim();

  return (
    <div className="loading-image-container">
      {isLoading && showLoadingSpinner && (
        <div className="image-loading-overlay">
          <div className="image-loading-spinner"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default LoadingImage;
