import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface FingerprintIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FingerprintIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isPressed?: boolean;
}

const PATH_VARIANTS: Variants = {
  normal: { 
    pathLength: 0, 
    opacity: 0.25,
    transition: { 
      duration: 0.15,
      ease: "easeOut"
    }
  },
  animate: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const FingerprintIcon = forwardRef<FingerprintIconHandle, FingerprintIconProps>(
  ({ className, size = 64, isPressed, onMouseDown, onTouchStart, ...props }, ref) => {
    const controls = useAnimation();

    const triggerScan = useCallback(async () => {
      await controls.set("normal");
      controls.start("animate");
    }, [controls]);

    useImperativeHandle(ref, () => ({
      startAnimation: () => {
        triggerScan();
      },
      stopAnimation: () => {
        controls.start("normal");
      },
    }));

    useEffect(() => {
      if (isPressed) {
        triggerScan();
      }
    }, [isPressed, triggerScan]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        triggerScan();
        onMouseDown?.(e);
      },
      [triggerScan, onMouseDown]
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLDivElement>) => {
        triggerScan();
        onTouchStart?.(e);
      },
      [triggerScan, onTouchStart]
    );

    return (
      <div
        className={cn("inline-flex items-center justify-center select-none", className)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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
          <path
            d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
            variants={PATH_VARIANTS}
          />

          <path
            d="M14 13.12c0 2.38 0 6.38-1 8.88"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M14 13.12c0 2.38 0 6.38-1 8.88"
            variants={PATH_VARIANTS}
          />

          <path
            d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
            variants={PATH_VARIANTS}
          />

          <path
            d="M2 12a10 10 0 0 1 18-6"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M2 12a10 10 0 0 1 18-6"
            variants={PATH_VARIANTS}
          />

          <path d="M2 16h.01" fill="none" strokeOpacity={0.3} strokeWidth="2" />
          <motion.path
            animate={controls}
            initial="normal"
            d="M2 16h.01"
            variants={PATH_VARIANTS}
          />

          <path
            d="M21.8 16c.2-2 .131-5.354 0-6"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M21.8 16c.2-2 .131-5.354 0-6"
            variants={PATH_VARIANTS}
          />

          <path
            d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
            variants={PATH_VARIANTS}
          />

          <path
            d="M8.65 22c.21-.66.45-1.32.57-2"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M8.65 22c.21-.66.45-1.32.57-2"
            variants={PATH_VARIANTS}
          />

          <path
            d="M9 6.8a6 6 0 0 1 9 5.2v2"
            fill="none"
            strokeOpacity={0.3}
            strokeWidth="2"
          />
          <motion.path
            animate={controls}
            initial="normal"
            d="M9 6.8a6 6 0 0 1 9 5.2v2"
            variants={PATH_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

FingerprintIcon.displayName = "FingerprintIcon";

export { FingerprintIcon };

