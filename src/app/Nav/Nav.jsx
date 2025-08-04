"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./Nav.css";
import logo from "./logo.png";
import { FaHome, FaBoxOpen, FaInfoCircle, FaNewspaper, FaPhone } from "react-icons/fa";

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
        title: "لیزرتگ",
        href: "/products/",
      },
      {
        title: "لیزرماز",
        href: "/products/",
      },
      {
        title: "اتاق وحشت",
        href: "/products/",
      },
      {
        title: "سرسره",
        href: "/products/",
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
    } else {
      if (item.href) {
        if (item.href.startsWith("#")) {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          // استفاده از next/link، پس ریدایرکت با لینک انجام میشه
          window.location.href = item.href;
        }
      }
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest(".Nav")) {
        setMenuOpen(false);
      }
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

  return (
    <>
      <div className={`Nav ${showNav ? "Nav--visible" : "Nav--hidden"}`}>
        <div className={`right ${menuOpen ? "open" : ""}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            خانه
          </Link>

          <div className="has-dropdown">
            <span>محصولات</span>
            {renderDesktopDropdown(menuItems.find((item) => item.title === "محصولات")?.children || [])}
          </div>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            درباره ما
          </a>
          <Link href="/news" onClick={() => setMenuOpen(false)}>
            اخبار
          </Link>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
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
