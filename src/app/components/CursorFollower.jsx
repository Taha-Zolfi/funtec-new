'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

const CursorFollower = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [cursorVariant, setCursorVariant] = useState('default');
  const [cursorText, setCursorText] = useState('');

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = (e) => {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'a' || target.closest('a')) {
        setCursorVariant('link');
        setCursorText('');
      } else if (target.tagName.toLowerCase() === 'button' || target.closest('button')) {
        setCursorVariant('button');
        setCursorText('');
      } else if (target.tagName.toLowerCase() === 'img' || target.closest('img')) {
        setCursorVariant('image');
        setCursorText('دیدن');
      } else {
        setCursorVariant('default');
        setCursorText('');
      }
    };

    const handleMouseLeave = () => {
      setCursorVariant('default');
      setCursorText('');
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseEnter);
    window.addEventListener('mouseout', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseEnter);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      opacity: 0.8,
      scale: 1,
      backgroundColor: 'rgba(19, 200, 255, 0.15)',
      borderColor: '#13c8ff',
    },
    link: {
      opacity: 1,
      scale: 1.5,
      backgroundColor: 'rgba(255, 181, 39, 0.15)',
      borderColor: '#ffb527',
    },
    button: {
      opacity: 1,
      scale: 1.3,
      backgroundColor: 'rgba(19, 200, 255, 0.2)',
      borderColor: '#13c8ff',
    },
    image: {
      opacity: 1,
      scale: 1.2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: '#ffffff',
    }
  };

  return (
    <>
      <motion.div
        className="cursor-outer"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        animate={variants[cursorVariant]}
        transition={{
          type: "tween",
          duration: 0.2
        }}
      >
        {cursorText && (
          <span className="cursor-text">{cursorText}</span>
        )}
      </motion.div>
      <motion.div
        className="cursor-inner"
        style={{
          left: cursorX,
          top: cursorY,
        }}
        animate={{
          scale: cursorVariant !== 'default' ? 0 : 1
        }}
      />
    </>
  );
};

export default CursorFollower;

