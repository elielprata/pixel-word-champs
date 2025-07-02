import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`animate-pulse bg-white/30 rounded ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

interface UserCardSkeletonProps {
  className?: string;
}

export const UserCardSkeleton = ({ className = '' }: UserCardSkeletonProps) => {
  return (
    <div className={`bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton width="120px" height="20px" />
            <div className="flex items-center space-x-2">
              <Skeleton width="40px" height="16px" />
              <Skeleton width="80px" height="20px" className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <Skeleton width="80px" height="16px" className="mb-2" />
          <Skeleton width="60px" height="24px" />
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <Skeleton width="90px" height="16px" className="mb-2" />
          <Skeleton width="50px" height="24px" />
        </div>
      </div>
    </div>
  );
};