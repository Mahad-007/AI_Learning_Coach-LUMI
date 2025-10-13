import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap } from 'lucide-react';

interface XPPopupProps {
  xpAmount: number;
  newLevel: number;
  levelUp: boolean;
  onClose: () => void;
}

export function XPPopup({ xpAmount, newLevel, levelUp, onClose }: XPPopupProps) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-8 max-w-md w-full text-center space-y-6 bg-gradient-to-br from-primary/10 via-background to-background">
          {/* XP Amount */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/50"
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* XP particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            ))}
          </motion.div>

          {/* Text */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-primary"
            >
              +{xpAmount} XP
            </motion.h2>
            
            {levelUp ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <p className="text-2xl font-bold">🎊 Level Up! 🎊</p>
                <p className="text-xl text-muted-foreground">
                  You're now <span className="text-primary font-bold">Level {newLevel}</span>
                </p>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground"
              >
                Great job! Keep learning!
              </motion.p>
            )}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Level {newLevel}</span>
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

