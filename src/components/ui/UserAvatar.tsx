import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16'
};

export const UserAvatar = ({ src, alt, size = 'md', className = '' }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!src);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`${sizeMap[size]} bg-white/20 rounded-full flex items-center justify-center overflow-hidden relative ${className}`}>
      {src && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
          )}
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover rounded-full"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </>
      ) : (
        <User 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-white/80`}
          aria-label={alt}
        />
      )}
    </div>
  );
};