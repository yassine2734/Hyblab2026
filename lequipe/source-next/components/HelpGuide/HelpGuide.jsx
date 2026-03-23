"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withBasePath } from '@/lib/withBasePath';
import styles from './HelpGuide.module.css';

const TypeWriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default function HelpGuide({ steps, onFinish, autoOpen = false, autoOpenKey = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const playSound = (type) => {
    try {
      let path = '';
      let vol = 0.1;
      if (type === 'appear') {
        path = withBasePath('/home/sons/sifflet.mp3');
        vol = 0.05;
      } else if (type === 'click') {
        path = withBasePath('/home/sons/bouton.mp3');
        vol = 0.1;
      }
      if (path) {
        const audio = new Audio(path);
        audio.volume = vol;
        audio.play().catch(() => { });
      }
    } catch (e) { }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      if (onFinish) onFinish();
    }
  };

  const skipAll = () => {
    setIsOpen(false);
    if (onFinish) onFinish();
  };

  useEffect(() => {
    if (!autoOpen || !steps || steps.length === 0) return;
    if (typeof window === 'undefined') return;

    if (autoOpenKey) {
      try {
        const seen = window.localStorage.getItem(autoOpenKey);
        if (seen) return;
      } catch (e) {
        // In private browsing, localStorage may be blocked. Proceed without persistence.
      }
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      playSound('appear');
      if (autoOpenKey) {
        try {
          window.localStorage.setItem(autoOpenKey, '1');
        } catch (e) { }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [steps, autoOpen, autoOpenKey]);

  const currentData = steps[currentStep];
  const refereeSide = currentData?.refereeSide || 'left'; // default to left

  return (
    <>
      {/* BOUTON SIFFLET D'OR FIXE */}
      <motion.button
        id="help-button"
        className={styles.whistleBtn}
        onClick={() => {
          setIsOpen(true);
          setCurrentStep(0);
          playSound('appear');
        }}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
        whileTap={{ scale: 0.9 }}
      >
        <img src={withBasePath('/arbitre/sifflet.png')} alt="Aide" />
      </motion.button>

      {/* OVERLAY D'AIDE */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="help-overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={currentStep}
              className={`${styles.guideWrapper} ${refereeSide === 'right' ? styles.sideRight : styles.sideLeft}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                top: currentData.position.top,
                bottom: currentData.position.bottom,
                left: currentData.position.left,
                right: currentData.position.right,
                transform: currentData.position.transform
              }}
            >
              {/* L'ARBITRE */}
              <motion.div
                className={styles.arbitreFull}
                initial={{ x: refereeSide === 'left' ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <img
                  src={withBasePath(refereeSide === 'left' ? '/arbitre/arbitre_gauche.png' : '/arbitre/arbitre_droite.png')}
                  alt="L'Arbitre"
                />
              </motion.div>

              {/* LA BULLE DE PAROLE */}
              <motion.div
                className={styles.speechBubble}
                initial={{ scale: 0.9, opacity: 0, x: refereeSide === 'left' ? 20 : -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className={styles.bubbleContent}>
                  <div className={styles.textContainer}>
                    <TypeWriterText text={currentData.text} />
                  </div>

                  <div className={styles.actions}>
                    <button onClick={skipAll} className={styles.skipBtn}>Passer</button>
                    <button onClick={nextStep} className={styles.nextBtn}>
                      {currentStep === steps.length - 1 ? "Ok !" : "Suivant"}
                    </button>
                  </div>
                </div>

                {/* Flèche de la bulle vers l'arbitre */}
                <div className={styles.tail} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
