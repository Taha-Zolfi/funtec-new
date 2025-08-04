// src/components/HomeClient.js
"use client";

import { Suspense, useEffect, useState, useRef, useMemo, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import "./Home.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

const FerrisWheel = lazy(() => import("./FerrisWheel"));

function ParticleField({ count = 3000, color = "#aaccff", size = 0.008 }) {
  const ref = useRef();
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(count * 3), { radius: 10 })
  );
  const sizes = useRef(new Float32Array(count));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      sizes.current.set([size * (0.5 + Math.random() * 0.5)], i);
    }
  }, [count, size]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 40;
      ref.current.rotation.y -= delta / 50;
    }
  });

  return (
    <Points
      ref={ref}
      positions={sphere}
      stride={3}
      frustumCulled={false}
      scale={1}
    >
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={1}
      />
    </Points>
  );
}

function CreativeScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        background: "linear-gradient(45deg, #040418, black, #181403ff)",
      }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 5, 10]} intensity={0.6} color="#66aaff" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#ff88cc" />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#ffffff" />
      <ParticleField count={2500} color="#aaccff" size={0.009} />
      <ParticleField count={1500} color="#ccddff" size={0.006} />
      <ParticleField count={1000} color="#ffdde0" size={0.004} />
    </Canvas>
  );
}

export default function HomeClient({
  title,
  subtitle,
  productButtonText,
  contactButtonText,
  schemaData,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 1,
          staggerChildren: 0.3,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 80, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      },
    }),
    []
  );

  const mobileItemVariants = useMemo(
    () => ({
      hidden: { y: 50, opacity: 0, scale: 0.9 },
      visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut",
        },
      },
    }),
    []
  );

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <div className="home">
        <CreativeScene3D className="bgg" />

        <motion.div
          className="content-container"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <motion.div
            className="main"
            variants={isMobile ? mobileItemVariants : itemVariants}
          >
            <motion.h1
              className="h-title"
              variants={isMobile ? mobileItemVariants : itemVariants}
            >
              {title}
            </motion.h1>

            <motion.p
              className="subtitle"
              variants={isMobile ? mobileItemVariants : itemVariants}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="home-buttons"
              variants={isMobile ? mobileItemVariants : itemVariants}
            >
            <Link href="/products" passHref legacyBehavior>
              <motion.button
                className="home-btn gallery"
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                as="a"
              >
                {productButtonText}
              </motion.button>
            </Link>
            <a href="#contact">
              <motion.button
                className="home-btn contact"
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {contactButtonText}
              </motion.button>
            </a>
            </motion.div>
          </motion.div>

          {isLoaded && !isMobile && (
            <motion.div className="ferris-wheel-container" variants={itemVariants}>
              <Canvas
                ref={canvasRef}
                camera={{ position: [0, 0, 2.5], fov: 75 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance",
                }}
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
              >
                <Suspense fallback={null}>
                  <ambientLight intensity={0.4} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={0.8}
                    color="#ffffff"
                  />
                  <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffb527" />
                  <pointLight position={[10, 10, 10]} intensity={0.3} color="#13c8ff" />
                  <Environment preset="night" />
                  <group scale={[1.4, 1.4, 1.4]} position={[0.5, 1, 0]}>
                    <FerrisWheel />
                  </group>
                </Suspense>
              </Canvas>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}