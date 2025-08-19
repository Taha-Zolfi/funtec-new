"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./Nav.css";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import logoSrc from './logo.png';
import { Suspense } from 'react';

import { FaHome, FaBoxOpen, FaInfoCircle, FaNewspaper, FaPhone } from "react-icons/fa";

// Memoize menu items for better performance
const MenuItem = memo(({ item, isOpen, toggleSubmenu }) => {
  return (
    <div className={`menu-item ${isOpen ? 'open' : ''}`}>
      <div onClick={toggleSubmenu}>
        {item.icon}
        <span>{item.title}</span>
      </div>
      {item.children && isOpen && <SubMenu items={item.children} />}
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

const SubMenu = memo(({ items }) => {
  return (
    <div className="submenu">
      {items.map((item, index) => (
        <Link href={item.href || '#'} key={index}>
          <span>{item.title}</span>
        </Link>
      ))}
    </div>
  );
});

SubMenu.displayName = 'SubMenu';

const menuItems = [
  {
    title: "خانه",
    icon: <FaHome />,
    href: "/",
  },
  {
    title: "محصولات",
    icon: <FaBoxOpen />,
    children: [
      {
        title: "محصولات گروهی",
        children: [
          {
            title: "لیزرتگ",
            id: 8,
            href: "/products/1",
          },
          {
            title: "لیزرماز",
            id: 7,
            href: "/products/#7",
          },
          
          {
            title: "اتاق فرار",
            id: 10,
            href: "/products/#10",
          },
          {
            title: "حریم وحشت",
            id: 11,
            href: "/products/#11",
          },
          {
            title: "سینما وحشت",
            id: 12,
            href: "/products/#12",
          },
        ],
      },
      {
        title: "محصولات گیمی",
        children: [
          {
            title: "فال بال",
            id: 13,
            href: "/products/#13",
          },
          {
            title: "فایربال",
            id: 14,
            href: "/products/#14",
          },
          {
            title: "دربی",
            id: 15,
            href: "/products/#15",
          },
          {
            title: "تیراندازی",
            id: 16,
            href: "/products/#16",
          },
          {
            title: "چک زن",
            id: 17,
            href: "/products/#17",
          },
          {
            title: "گیم گلابی",
            id: 18,
            href: "/products/#18",
          },
          {
            title: "چنگک",
            id: 19,
            href: "/products/#19",
          },
          {
            title: "ایرهاکی",
            id: 20,
            href: "/products/#20",
          },
          {
            title: "هند اسپید",
            id: 21,
            href: "/products/#21",
          },
                    {
            title: "هامر",
            id: 22,
            href: "/products/#22",
          },
        ],
      },
    ],
  },
  {
    title: "درباره ما",
    icon: <FaInfoCircle />,
    href: "#about",
  },
  {
    title: "اخبار",
    icon: <FaNewspaper />,
    href: "/news",
  },
  {
    title: "تماس با ما",
    icon: <FaPhone />,
    href: "#contact",
  },
];

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setShowNav(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
        setMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleMobileDropdown = (key) => {
    setMobileDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMobileItemClick = (item, key, e) => {
    e.preventDefault();
    e.stopPropagation();

    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      toggleMobileDropdown(key);
    } 
    else {
      if (item.href) {
        if (item.href === "#about" || item.href === "#contact") {
          // Always go to root with hash for about/contact
          router.push(`/#${item.href.replace('#', '')}`);
        } else if (item.href.startsWith("/products/#")) {
          router.push(item.href);
        } else if (item.href.startsWith("#")) {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          window.location.href = item.href;
        }
      }
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuOpen) return;

      // If click is inside the top Nav or inside the mobile menu overlay, ignore
      if (event.target.closest('.Nav') || event.target.closest('.mobile-menu') || event.target.closest('.mobile-overlay')) {
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

  // رندر dropdown دسکتاپ (recursive)
  const renderDesktopDropdown = (items, level = 0) => {
    return (
      <div className={`nav-dropdown level-${level}`}>
        {items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          return (
            <div key={index} className="nav-dropdown-item-wrapper">
              {hasChildren ? (
                <>
                  <div className={`nav-dropdown-item has-children`}>
                    <span>{item.title}</span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {renderDesktopDropdown(item.children, level + 1)}
                </>
              ) : (
                <Link href={item.href} className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                  {item.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // رندر منو موبایل (recursive)
  const renderMobileMenuItem = (item, index, level = 0) => {
    const key = `${level}-${index}`;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = mobileDropdowns[key];

    if (hasChildren) {
      return (
        <div key={key} className="mobile-dropdown">
          <div
            className={`mobile-dropdown-header level-${level} ${isOpen ? "active" : ""}`}
            onClick={(e) => handleMobileItemClick(item, key, e)}
          >
            {level === 0 && item.icon && <span className="menu-icon">{item.icon}</span>}
            <span className="menu-title">{item.title}</span>
            <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
          </div>
          <div className={`mobile-dropdown-content ${isOpen ? "open" : ""}`}>
            {item.children.map((child, childIndex) => renderMobileMenuItem(child, childIndex, level + 1))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className={`mobile-menu-item level-${level}`} onClick={(e) => handleMobileItemClick(item, key, e)}>
        {level === 0 && item.icon && <span className="menu-icon">{item.icon}</span>}
        <span className="menu-title">{item.title}</span>
      </div>
    );
  };

  // Dynamically set nav height for yellow bar
  const navRef = useRef(null);


  return (
    <>
      <div ref={navRef} className={`Nav ${showNav ? "Nav--visible" : "Nav--hidden"}`}>
        {/* mobile-only simple header: logo left, hamburger stays on the right */}
        <Link href="/" onClick={() => setMenuOpen(false)} className="nav-logo">
          <Image src={logoSrc} alt="logo" width={40} height={40} priority={false} />
        </Link>
        <div className={`right ${menuOpen ? "open" : ""}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            خانه
          </Link>

          <div className="has-dropdown">
            <span>محصولات</span>
            {renderDesktopDropdown(menuItems.find((item) => item.title === "محصولات")?.children || [])}
          </div>

          <a
            href="/#about"
            onClick={e => {
              e.preventDefault();
              router.push('/#about');
              setMenuOpen(false);
            }}
          >
            درباره ما
          </a>
          <Link href="/news" onClick={() => setMenuOpen(false)}>
            اخبار
          </Link>
          <a
            href="/#contact"
            onClick={e => {
              e.preventDefault();
              router.push('/#contact');
              setMenuOpen(false);
            }}
          >
            تماس با ما
          </a>
        </div>

        <div
          className={`menu-icon ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="toggle menu"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleMenu();
          }}
        >
          <div />
          <div />
          <div />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${menuOpen ? "active" : ""}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <h2>منو</h2>
            <button className="close-btn" onClick={() => setMenuOpen(false)}>
              ✕
            </button>
          </div>

          <div className="mobile-menu-content">{menuItems.map((item, index) => renderMobileMenuItem(item, index))}</div>
        </div>
      </div>
    </>
  );
};

export default Nav;
