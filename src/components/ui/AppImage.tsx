import React from 'react';
import Image from 'next/image';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const AppImage: React.FC<AppImageProps> = ({ src, alt, width, height, className = '' }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
    />
  );
};

export default AppImage;