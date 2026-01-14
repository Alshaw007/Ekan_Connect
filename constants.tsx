
import React from 'react';

export const COLORS = {
  obsidian: '#0B0B0B',
  gold: '#FCD116',
  red: '#CE1126',
  green: '#008751',
  indigo: '#4B0082',
  gray: '#1A1A1A',
  textGray: '#A1A1A1',
};

// EKAN high-energy linear gradient
export const EKAN_GRADIENT = "linear-gradient(135deg, #CE1126 0%, #FCD116 50%, #008751 100%)";
export const EKAN_GRADIENT_CSS = "from-[#CE1126] via-[#FCD116] to-[#008751]";

export const VaiPattern = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5 absolute pointer-events-none">
    <path d="M10 10L30 10M10 20L30 20M20 10L20 30" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
    <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="1" strokeOpacity="0.2"/>
    <path d="M70 70L90 90M90 70L70 90" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
  </svg>
);

export const KruPattern = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5 absolute pointer-events-none">
      <path d="M0 50L50 0L100 50L50 100L0 50Z" stroke={COLORS.gold} strokeWidth="1" />
      <circle cx="50" cy="50" r="20" stroke={COLORS.red} strokeWidth="1" />
      <rect x="40" y="40" width="20" height="20" stroke={COLORS.green} strokeWidth="1" />
    </svg>
);
