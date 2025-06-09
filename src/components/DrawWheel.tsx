import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface DrawWheelProps {
  onSpinComplete: () => void;
}

export default function DrawWheel({ onSpinComplete }: DrawWheelProps) {
  const controls = useAnimation();

  useEffect(() => {
    const doSpin = async () => {
      await controls.start({
        rotate: [0, 360, 720, 1080, 1440, 1800],
        transition: { duration: 3.5, ease: "easeOut" },
      });
      onSpinComplete();
    };
    doSpin();
  }, [controls, onSpinComplete]);

  return (
    <motion.div
        animate={controls}
    >
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <path
                d="M 50,5 A 45,45 0 0,1 95,50"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="6"
                strokeLinecap="round"
            />
        </svg>
    </motion.div>
  );
}