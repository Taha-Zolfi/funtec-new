// src/components/ContactClient.js
'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { Box, Torus } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTelegram, FaInstagram, FaPhone, FaHeadset, FaUsers, FaBuilding } from 'react-icons/fa';

// مپ آیکون‌ها برای رندر داینامیک
const iconMap = {
  FaMapMarkerAlt,
  FaTelegram,
  FaInstagram,
  FaPhone,
  FaHeadset,
  FaUsers,
  FaBuilding,
};
import * as random from 'maath/random/dist/maath-random.esm';
import Image from 'next/image';

import './Contact.css';
import logo from './logo.png';

// ... (Keep FloatingGeometry, ParticleField, CreativeScene3D components as they are) ...

const DepartmentContact = ({ title, phones, icon: Icon, delay = 0 }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      },
    },
  };

  return (
    <motion.div className="department-section" variants={itemVariants}>
      <div className="department-header">
        <div className="department-icon-wrapper">
          {Icon && <Icon className="department-icon" />}
        </div>
        <h3 className="department-title">{title}</h3>
      </div>
      <div className="department-phones">
        {phones.map((phone, index) => (
          <motion.a
            key={index}
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="phone-link"
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <FaPhone className="phone-icon-small" />
            <span>{phone}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default function ContactClient({ departments, socialLinks, addresses, footerText }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3,
      },
    },
  };

  const [sparkles, setSparkles] = useState([]);
  useEffect(() => {
    const arr = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 0.5 + 0.5,
    }));
    setSparkles(arr);
  }, []);

  return (
    <div id="contact" className="contact-container">
      {/* <CreativeScene3D /> */}

      <div className="sparkles-container">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animationDelay: `${sparkle.delay}s`,
              transform: `scale(${sparkle.size})`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="contact-wrapper"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h1 className="contact-title" variants={titleVariants}>
          تماس با ما
        </motion.h1>

        <motion.div className="contact-content" variants={itemVariants}>
          <div className="departments-grid">
            {departments.map((dept, index) => (
              <DepartmentContact
                key={index}
                title={dept.title}
                phones={dept.phones}
                icon={dept.icon}
                delay={0.1 * (index + 1)}
              />
            ))}
          </div>

           <motion.div className="social-grid" variants={itemVariants}>
             {socialLinks.map((link, index) => {
               const Icon = iconMap[link.icon];
               return (
                 <motion.a
                   key={index}
                   href={link.href}
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`contact-item social-item ${link.className}`}
                   whileHover={{ scale: 1.03, y: -3 }}
                   whileTap={{ scale: 0.98 }}
                   transition={{ duration: 0.2 }}
                 >
                   <div className={`icon-wrapper ${link.wrapperClass}`}>
                     {Icon && <Icon className={`icon ${link.iconClass}`} />}
                   </div>
                   <span>{link.handle}</span>
                   <div className={`item-glow ${link.glowClass}`} />
                 </motion.a>
               );
             })}
          </motion.div>

          {addresses.map((address, index) => (
            <motion.div key={index} className="address-section" variants={itemVariants}>
              <div className="address-card">
                <div className="icon-wrapper location-wrapper">
                  <FaMapMarkerAlt className="icon location-icon" />
                </div>
                <div className="address-content">
                  <h3 className="address-title">{address.title}</h3>
                  <span className="address-text">{address.text}</span>
                </div>
                <div className="item-glow location-glow" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="contact-footer" variants={itemVariants}>
          <Image src={logo} alt="فان تک" className="contact-logo" />
          <span>{footerText}</span>
        </motion.div>

        <motion.p className="copyright desktop-only" variants={itemVariants}>
          © 1404 فان تک. تمامی حقوق محفوظ است.
        </motion.p>
      </motion.div>
    </div>
  );
}