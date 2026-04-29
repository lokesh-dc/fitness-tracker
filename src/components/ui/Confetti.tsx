"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Confetti({ trigger }: { trigger: boolean }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => setActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                top: "-10%", 
                left: `${Math.random() * 100}%`,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5,
                rotate: 0
              }}
              animate={{ 
                top: "110%",
                left: `${(Math.random() * 100)}%`,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: Math.random() * 2 + 1,
                ease: "linear"
              }}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                backgroundColor: ["#f97316", "#fb923c", "#fdba74", "#ffffff"][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
