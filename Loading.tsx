import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`${sizes[size]} border-4 border-primary/20 border-t-primary rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-gray-500">{text}</p>}
    </div>
  );
};
