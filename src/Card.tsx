import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      bg-white rounded-[2rem] p-6 
      border border-purple-50
      shadow-[0_8px_30px_rgb(243,240,255,0.5)] 
      transition-all duration-300
      ${hover ? 'hover:shadow-[0_15px_45px_rgb(235,230,255,0.8)] hover:-translate-y-1.5' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
