import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Button, Container, Dropdown } from 'react-bootstrap';
import { FaGlobe } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const LANGS = [
  { key: 'en', label: 'English' },
  { key: 'tc', label: '繁' },
  { key: 'sc', label: '简' },
];

// 多語言標籤
const LABELS = {
  en: {
    districts: 'Districts',
    metered: 'Metered Parking Spaces',
    camera: 'Traffic Camera Locations',
    news: 'Traffic Notices',
    settings: 'Settings',
  },
  tc: {
    districts: '地區',
    metered: '咪錶泊車位',
    camera: '交通監察鏡頭',
    news: '交通通知',
    settings: '設定',
  },
  sc: {
    districts: '地区',
    metered: '咪表停车位',
    camera: '交通监控摄像头',
    news: '交通通知',
    settings: '设置',
  },
};

// 請補上你的 districts 與 meteredParking 資料
const districts = [
  // ...existing code...
];

const meteredParking = [
  // ...existing code...
];

const Header = ({
  currentLang,
  onLangChange,
  onThemeToggle,
  darkMode,
}) => {
  const [lang, setLang] = useState(currentLang || localStorage.getItem('lang') || 'en');

  useEffect(() => {
    setLang(currentLang || localStorage.getItem('lang') || 'en');
  }, [currentLang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    if (onLangChange) onLangChange(newLang);
  };

  const langOptions = LANGS.filter(l => l.key !== lang);

  return (
    <Navbar
      bg={darkMode ? 'dark' : 'light'}
      variant={darkMode ? 'dark' : 'light'}
      expand="lg"
      sticky="top"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <Container>
        <Navbar.Brand href="/" style={{ fontWeight: 800, letterSpacing: 1 }}>
          EaseParkHK
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <NavDropdown title={LABELS[lang].districts} id="districts-dropdown">
              {districts.map((d) => (
                <NavDropdown key={d.name} title={d.name} id={`sub-${d.name}`} drop="end">
                  {d.sub.map((s) => (
                    <NavDropdown.Item key={s.name} href={s.url}>
                      {s.name}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              ))}
            </NavDropdown>
            <NavDropdown title={LABELS[lang].metered} id="metered-dropdown">
              {meteredParking.map((m) => (
                <NavDropdown.Item key={m.name} href={m.url}>
                  {m.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link href="/camera">{LABELS[lang].camera}</Nav.Link>
            <Nav.Link href="/news">{LABELS[lang].news}</Nav.Link>
          </Nav>
          <Nav>
            {/* Language Switcher */}
            <Dropdown align="end" className="me-2">
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-lang" style={{ minWidth: 60 }}>
                <FaGlobe style={{ marginRight: 4 }} />
                {LANGS.find(l => l.key === lang)?.label}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {langOptions.map(opt => (
                  <Dropdown.Item key={opt.key} onClick={() => handleLangChange(opt.key)}>
                    {opt.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/settings">{LABELS[lang].settings}</Nav.Link>
            <Button
              variant="outline-secondary"
              className="ms-2"
              onClick={onThemeToggle}
              title="Toggle dark mode"
            >
              <i
                className={`glyphicon ${
                  darkMode ? 'glyphicon-sun' : 'glyphicon-adjust'
                } night-mode-icon`}
              />
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;