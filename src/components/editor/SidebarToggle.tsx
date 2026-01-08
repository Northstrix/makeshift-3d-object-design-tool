"use client";

import React from 'react';
import { motion } from 'framer-motion';

const FoldIcon: React.FC<{ isRTL: boolean; size?: number }> = ({
  isRTL,
  size = 24,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: `rotate(${isRTL ? 90 : -90}deg)` }}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 13v-8l-3 3m6 0l-3 -3" />
    <path d="M9 17l1 0" />
    <path d="M14 17l1 0" />
    <path d="M19 17l1 0" />
    <path d="M4 17l1 0" />
  </svg>
);

interface SidebarToggleProps {
    onClick: () => void;
    isRTL: boolean;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ onClick, isRTL }) => {
  return (
    <motion.button
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground transition-colors duration-300 ease-in-out"
      aria-label="Collapse sidebar"
    >
      <FoldIcon isRTL={isRTL} size={24} />
    </motion.button>
  );
};
