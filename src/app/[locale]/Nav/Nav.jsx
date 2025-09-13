// مسیر: src/app/[locale]/Nav/Nav.jsx

"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
// تغییر ۱: i18n را از هوک useTranslation می‌گیریم
import { useTranslation } from 'react-i18next';
import { FaHome, FaBoxOpen, FaInfoCircle, FaNewspaper, FaPhone } from "react-icons/fa";
import LanguageSwitcher from './LanguageSwitcher';
import logoSrc from './logo.png';
import "./Nav.css";

const iconMap = {
  FaHome: <FaHome />,
  FaBoxOpen: <FaBoxOpen />,
  FaInfoCircle: <FaInfoCircle />,
  FaNewspaper: <FaNewspaper />,
  FaPhone: <FaPhone />,
};

const Nav = () => {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const navRef = useRef(null);

  const menuItems = Array.isArray(t('nav.menuItems', { returnObjects: true })) 
    ? t('nav.menuItems', { returnObjects: true }) 
    : [];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) { setShowNav(true); } 
      else if (currentScrollY > lastScrollY && currentScrollY > 100) { setShowNav(false); setMenuOpen(false); } 
      else if (currentScrollY < lastScrollY) { setShowNav(true); }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuOpen) return;
      if (event.target.closest('.Nav') || event.target.closest('.mobile-menu')) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setMobileDropdowns({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleMobileDropdown = (key) => setMobileDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));

  // === تغییر ۲: یک تابع کمکی برای ساختن لینک‌های چندزبانه ===
  const createLocalizedPath = (path) => {
    if (path.startsWith('#') || path.startsWith('/#')) {
        // برای لینک‌های انکر، فقط قسمت انکر را برمی‌گردانیم
        const anchor = path.substring(path.indexOf('#'));
        return `/${i18n.language}${anchor}`;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${i18n.language}${cleanPath}`;
  };

  const handleMobileItemClick = (item, key, e) => {
    e.preventDefault();
    e.stopPropagation();
    const hasChildren = item.children && item.children.length > 0;
    if (hasChildren) {
      toggleMobileDropdown(key);
    } else if (item.href) {
      // === تغییر ۳: از تابع کمکی برای ساخت مسیر صحیح استفاده می‌کنیم ===
      router.push(createLocalizedPath(item.href));
      setMenuOpen(false);
    }
  };

// در فایل Nav.jsx، این تابع را جایگزین کنید

  const renderDesktopDropdown = (items, level = 0) => {
    // Ensure items is an array
    const itemsArray = Array.isArray(items) ? items : [];
    
    return (
      <div className={`nav-dropdown level-${level}`}>
        {itemsArray.map((item, index) => {
          const hasChildren = item?.children && Array.isArray(item.children) && item.children.length > 0;
          return (
            <div key={index} className="nav-dropdown-item-wrapper">
              {hasChildren ? (
                <>
                  {/* === تغییر کلیدی: تگ span اضافه با محتوای ▼ حذف شد === */}
                  <div className={`nav-dropdown-item has-children`}>
                    <span>{item.title}</span>
                  </div>
                  {renderDesktopDropdown(item.children, level + 1)}
                </>
              ) : (
                <Link href={createLocalizedPath(item.href)} className="nav-dropdown-item">
                  {item.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  const renderMobileMenuItem = (item, index, level = 0) => {
    const key = `${level}-${index}`;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = mobileDropdowns[key];
    return (
      <div key={key} className={`mobile-menu-item-container level-${level}`}>
        <div className={`mobile-menu-item ${isOpen ? "active" : ""}`} onClick={(e) => handleMobileItemClick(item, key, e)}>
          {level === 0 && item.icon && <span className="menu-icon">{iconMap[item.icon]}</span>}
          <span className="menu-title">{item.title}</span>
          {hasChildren && <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>}
        </div>
        {hasChildren && (
          <div className={`mobile-dropdown-content ${isOpen ? "open" : ""}`}>
            {item.children.map((child, childIndex) => renderMobileMenuItem(child, childIndex, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div ref={navRef} className={`Nav ${showNav ? "Nav--visible" : "Nav--hidden"}`}>
        {/* === تغییر ۴: تمام لینک‌ها با تابع کمکی ما به‌روز می‌شوند === */}
        <Link href={createLocalizedPath('/')} onClick={() => setMenuOpen(false)} className="nav-logo">
          <Image src={logoSrc} alt="Funtech Logo" width={40} height={40} priority={true} />
        </Link>
        
        <div className={`right ${menuOpen ? "open" : ""}`}>
          <Link href={createLocalizedPath('/')} onClick={() => setMenuOpen(false)}>{t('nav.menuItems.0.title')}</Link>

          <div className="has-dropdown">
            <span>{t('nav.menuItems.1.title')}</span>
            {renderDesktopDropdown(t('nav.menuItems', { returnObjects: true })?.[1]?.children || [])}
          </div>

          <a href={createLocalizedPath('/about')} onClick={e => { e.preventDefault(); router.push(createLocalizedPath('/about')); setMenuOpen(false); }}>
            {t('nav.menuItems.2.title')}
          </a>

          <Link href={createLocalizedPath('/news')} onClick={() => setMenuOpen(false)}>
            {t('nav.menuItems.3.title')}
          </Link>

          <a href={createLocalizedPath('/#contact')} onClick={e => { e.preventDefault(); router.push(createLocalizedPath('/#contact')); setMenuOpen(false); }}>
            {t('nav.menuItems.4.title')}
          </a>
          
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </div>

        <div className={`menu-icon ${menuOpen ? "open" : ""}`} onClick={toggleMenu} aria-label="toggle menu" role="button">
          <div /><div /><div />
        </div>
      </div>

      <div className={`mobile-overlay ${menuOpen ? "active" : ""}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <h2>{t('nav.mobileMenuTitle')}</h2>
            <button className="close-btn" onClick={() => setMenuOpen(false)}>✕</button>
          </div>
          <div className="mobile-menu-content">
            {menuItems.map((item, index) => renderMobileMenuItem(item, index))}
          </div>
          <div className="language-switcher-container-mobile">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;