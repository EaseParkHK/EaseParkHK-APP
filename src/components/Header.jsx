import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Button, Container, Dropdown, Offcanvas, Form } from 'react-bootstrap';
import { FaGlobe, FaMoon, FaSun, FaHeart, FaCog, FaMapMarkerAlt, FaCar, FaListUl, FaBars } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// 多語言標籤
const LANGS = [
  { key: 'en', label: 'English' },
  { key: 'tc', label: '繁' },
  { key: 'sc', label: '简' },
];

const LABELS = {
  en: {
    home: 'Home',
    districts: 'Districts',
    metered: 'Metered Parking',
    camera: 'Traffic Cameras',
    news: 'Traffic Notices',
    settings: 'Settings',
    favourites: 'Favourites',
    theme: 'Theme',
    language: 'Language',
    quickLinks: 'Quick Links',
    menu: 'Menu',
  },
  tc: {
    home: '主頁',
    districts: '地區',
    metered: '咪錶泊車',
    camera: '交通鏡頭',
    news: '交通通知',
    settings: '設定',
    favourites: '收藏',
    theme: '主題',
    language: '語言',
    quickLinks: '快速連結',
    menu: '選單',
  },
  sc: {
    home: '主页',
    districts: '地区',
    metered: '咪表停车',
    camera: '交通摄像头',
    news: '交通通知',
    settings: '设置',
    favourites: '收藏',
    theme: '主题',
    language: '语言',
    quickLinks: '快速链接',
    menu: '菜单',
  },
};

const Header = ({
  currentLang,
  onLangChange,
  onThemeToggle,
  darkMode,
}) => {
  const [lang, setLang] = useState(currentLang || localStorage.getItem('lang') || 'en');
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLang(currentLang || localStorage.getItem('lang') || 'en');
  }, [currentLang]);

  // 控制 body class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    return () => document.body.classList.remove('dark-mode');
  }, [darkMode]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    if (onLangChange) onLangChange(newLang);
  };

  // 新增：快速連結
  const quickLinks = [
    { to: '/', icon: <FaMapMarkerAlt />, label: LABELS[lang].home },
    { to: '/#/settings', icon: <FaCog />, label: LABELS[lang].settings },
    { to: '/#/favourites', icon: <FaHeart />, label: LABELS[lang].favourites },
    { to: '/#/news', icon: <FaListUl />, label: LABELS[lang].news },
  ];

  return (
    <>
      <Navbar
        bg={darkMode ? 'dark' : 'light'}
        variant={darkMode ? 'dark' : 'light'}
        expand="lg"
        sticky="top"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        className="py-2"
      >
        <Container>
          <Navbar.Brand as={Link} to="/" style={{ fontWeight: 800, letterSpacing: 1, fontSize: 22 }}>
            <FaCar style={{ marginRight: 8, color: '#0d6efd' }} />
            EaseParkHK
          </Navbar.Brand>
          <Button
            variant={darkMode ? 'outline-light' : 'outline-dark'}
            className="d-lg-none"
            onClick={() => setShowMenu(true)}
            aria-label={LABELS[lang].menu}
          >
            <FaBars />
          </Button>
          <Navbar.Toggle aria-controls="main-navbar" className="d-none" />
          <Navbar.Collapse id="main-navbar" className="d-none d-lg-flex">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">{LABELS[lang].home}</Nav.Link>
              <Nav.Link as={Link} to="/news">{LABELS[lang].news}</Nav.Link>
              <Nav.Link as={Link} to="/camera">{LABELS[lang].camera}</Nav.Link>
              <Nav.Link as={Link} to="/settings">{LABELS[lang].settings}</Nav.Link>
            </Nav>
            <Nav>
              {/* 語言切換 */}
              <Dropdown align="end" className="me-2">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-lang" style={{ minWidth: 60 }}>
                  <FaGlobe style={{ marginRight: 4 }} />
                  {LANGS.find(l => l.key === lang)?.label}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {LANGS.filter(l => l.key !== lang).map(opt => (
                    <Dropdown.Item key={opt.key} onClick={() => handleLangChange(opt.key)}>
                      {opt.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              {/* 主題切換 */}
              <Button
                variant="outline-secondary"
                className="ms-2"
                onClick={onThemeToggle}
                title={LABELS[lang].theme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  borderRadius: '50%',
                  boxShadow: darkMode ? '0 2px 8px #0002' : '0 2px 8px #0001',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                {darkMode ? (
                  <FaSun className="night-mode-icon" color="#ffd700" />
                ) : (
                  <FaMoon className="night-mode-icon" color="#222" />
                )}
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Offcanvas 側邊選單（行動裝置友善） */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <FaCar style={{ marginRight: 8, color: '#0d6efd' }} />
            EaseParkHK
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {quickLinks.map(link => (
              <Nav.Link
                as={Link}
                to={link.to}
                key={link.to}
                onClick={() => setShowMenu(false)}
                active={location.pathname === link.to.replace('/#', '')}
                style={{ display: 'flex', alignItems: 'center', fontSize: 18, marginBottom: 8 }}
              >
                {link.icon}
                <span style={{ marginLeft: 8 }}>{link.label}</span>
              </Nav.Link>
            ))}
          </Nav>
          <hr />
          <div className="mb-3">
            <Form.Label>{LABELS[lang].language}</Form.Label>
            <Form.Select
              value={lang}
              onChange={e => handleLangChange(e.target.value)}
              className="mb-2"
            >
              {LANGS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </Form.Select>
          </div>
          <div>
            <Form.Label>{LABELS[lang].theme}</Form.Label>
            <Button
              variant={darkMode ? 'secondary' : 'outline-secondary'}
              onClick={onThemeToggle}
              className="w-100"
              style={{ marginTop: 4 }}
            >
              {darkMode ? <FaSun style={{ marginRight: 6 }} /> : <FaMoon style={{ marginRight: 6 }} />}
              {darkMode
                ? lang === 'en'
                  ? 'Dark Mode'
                  : lang === 'tc'
                  ? '深色模式'
                  : '深色模式'
                : lang === 'en'
                ? 'Light Mode'
                : lang === 'tc'
                ? '淺色模式'
                : '浅色模式'}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;