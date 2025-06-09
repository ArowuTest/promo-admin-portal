import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinnerRecord {
  msisdn: string;
  prize: string;
  position: number;
}

interface DrawResultsProps {
  winners: WinnerRecord[];
  runnerUps: WinnerRecord[];
  onComplete?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120 } },
};

export default function DrawResults({ winners, runnerUps, onComplete }: DrawResultsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}
    >
      {winners.map((w, idx) => (
        <AnimatePresence key={`winner-${idx}`}>
          <motion.div
            variants={itemVariants}
            style={{
              border: '2px solid #333',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#fafafa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onAnimationComplete={() => {
              if (idx === winners.length - 1 && onComplete) {
                onComplete();
              }
            }}
          >
            <strong>Winner #{w.position}</strong>
            <span style={{ marginTop: '0.5rem' }}>{w.msisdn}</span>
            <span style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{w.prize}</span>
          </motion.div>
        </AnimatePresence>
      ))}

      {runnerUps.map((r, idx) => (
        <AnimatePresence key={`runnerUp-${idx}`}>
          <motion.div
            variants={itemVariants}
            style={{
              border: '1px dashed #777',
              borderRadius: '8px',
              padding: '0.75rem',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <strong>Runner-Up #{r.position}</strong>
            <span style={{ marginTop: '0.5rem' }}>{r.msisdn}</span>
            <span style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{r.prize}</span>
          </motion.div>
        </AnimatePresence>
      ))}
    </motion.div>
  );
}
