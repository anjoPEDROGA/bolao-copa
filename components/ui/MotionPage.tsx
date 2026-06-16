"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type MotionPageProps = {
  children: ReactNode;
  className?: string;
};

export function MotionPage({ children, className = "" }: MotionPageProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
