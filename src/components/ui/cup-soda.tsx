"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface CupSodaIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CupSodaIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const STRAW_VARIANTS: Variants = {
  animate: {
    y: [0, -1.2, 0.2, 0],
    scaleY: [1, 1.06, 0.98, 1],
    transition: {
      duration: 2.2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
      times: [0, 0.35, 0.7, 1],
    },
  },
};

const WAVE_VARIANTS: Variants = {
  animate: {
    y: [0, -1.5, 0],
    transition: {
      duration: 1.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

const BUBBLE_VARIANTS: Variants = {
  animate: (delay: number) => ({
    opacity: [0, 0.9, 0.4, 0],
    y: [0, -3, -10, -14],
    scale: [1, 1, 0.85, 0.5],
    transition: {
      duration: 1.6,
      ease: "easeIn",
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 0.1,
      times: [0, 0.1, 0.7, 1],
    },
  }),
};

const BUBBLES = [
  { delay: 0, cx: 8.25, cy: 20.5, r: 0.75 },
  { delay: 0.35, cx: 11.25, cy: 19.5, r: 0.6 },
  { delay: 0.7, cx: 14, cy: 20.75, r: 0.6 },
  { delay: 1.05, cx: 9.75, cy: 19, r: 0.75 },
  { delay: 0.55, cx: 12.5, cy: 20, r: 0.45 },
] as const;

const CupSodaIcon = forwardRef<CupSodaIconHandle, CupSodaIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    useImperativeHandle(ref, () => ({
      startAnimation: () => {},
      stopAnimation: () => {},
    }));

    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" />
          <path d="M5 8h14" />
          <motion.path
            animate="animate"
            d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"
            variants={WAVE_VARIANTS}
          />
          <motion.path
            animate="animate"
            d="m12 8 1-6h2"
            style={{
              transformBox: "fill-box",
              originX: "50%",
              originY: "100%",
            }}
            variants={STRAW_VARIANTS}
          />
          {BUBBLES.map((b, i) => (
            <motion.circle
              animate="animate"
              custom={b.delay}
              cx={b.cx}
              cy={b.cy}
              fill="currentColor"
              key={i}
              r={b.r}
              stroke="none"
              style={{
                transformBox: "fill-box",
                originX: "50%",
                originY: "50%",
              }}
              variants={BUBBLE_VARIANTS}
            />
          ))}
        </svg>
      </div>
    );
  }
);

CupSodaIcon.displayName = "CupSodaIcon";

export { CupSodaIcon };
