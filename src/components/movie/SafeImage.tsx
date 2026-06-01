'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Film } from 'lucide-react';
import { cn } from '@/lib/utils';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  fallbackClassName?: string;
};

export default function SafeImage({
  src,
  alt,
  fallbackLabel,
  fallbackClassName,
  className,
  fill,
  onError,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const hasValidSrc = Boolean(src && !failed);

  if (!hasValidSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black',
          fill && 'absolute inset-0',
          className,
          fallbackClassName
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex max-w-[80%] flex-col items-center gap-2 text-center">
          <Film size={22} className="text-zinc-700" />
          {fallbackLabel && (
            <span className="line-clamp-2 text-xs font-medium leading-snug text-zinc-600">
              {fallbackLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  const imageSrc = src as string;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
