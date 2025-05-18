import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const districts = [
  {
    name: 'Hong Kong Island',
    url: '/hong_kong_island',
    sub: [
      { name: 'Central and Western District', url: '/carparkinfo/Central%20&%20Western' },
      { name: 'Wan Chai District', url: '/carparkinfo/Wan%20Chai' },
      { name: 'Eastern District', url: '/carparkinfo/Eastern' },
      { name: 'Southern District', url: '/carparkinfo/Southern' },
    ],
  },
  {
    name: 'Kowloon',
    url: '/kowloon',
    sub: [
      { name: 'Yau Tsim Mong District', url: '/carparkinfo/Yau%20Tsim%20Mong' },
      { name: 'Sham Shui Po District', url: '/carparkinfo/Sham%20Shui%20Po' },
      { name: 'Kowloon City District', url: '/carparkinfo/Kowloon%20City' },
      { name: 'Wong Tai Sin District', url: '/carparkinfo/Wong%20Tai%20Sin' },
      { name: 'Kwun Tong District', url: '/carparkinfo/Kwun%20Tong' },
    ],
  },
  {
    name: 'New Territories',
    url: '/new_territories',
    sub: [
      { name: 'Kwai Tsing District', url: '/carparkinfo/Kwai%20Tsing' },
      { name: 'Tsuen Wan District', url: '/carparkinfo/Tsuen%20Wan' },
      { name: 'Yuen Long District', url: '/carparkinfo/Yuen%20Long' },
      { name: 'Tuen Mun District', url: '/carparkinfo/Tuen%20Mun' },
      { name: 'North District', url: '/carparkinfo/North' },
      { name: 'Tai Po District', url: '/carparkinfo/Tai%20Po' },
      { name: 'Sha Tin District', url: '/carparkinfo/Sha%20Tin' },
      { name: 'Sai Kung District', url: '/carparkinfo/Sai%20Kung' },
      { name: 'Islands District', url: '/carparkinfo/Islands' },
    ],
  },
];

const meteredParking = [
  { name: 'Hong Kong Island Region', url: '/metered_parking_spaces_hong_kong_island' },
  { name: 'Kowloon Region', url: '/metered_parking_spaces_kowloon' },
  { name: 'New Territories Region', url: '/metered_parking_spaces_new_territories' },
];

const Header = ({
  currentLang = 'en',
  onLangChange = () => {},
}) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'enabled'
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
  }, [darkMode]);

  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  const langSwitch = (
    <Nav.Link onClick={onLangChange}>
      {currentLang === 'zh' ? 'English' : '繁'}
    </Nav.Link>
  );

  return (
    <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg">
      <Container>
        <Navbar.Brand href="/">EaseParkHK</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <NavDropdown title="Districts" id="districts-dropdown">
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
            <NavDropdown title="Metered Parking Spaces" id="metered-dropdown">
              {meteredParking.map((m) => (
                <NavDropdown.Item key={m.name} href={m.url}>
                  {m.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link href="/camera">Traffic Camera Locations</Nav.Link>
            <Nav.Link href="/news">Traffic Notices</Nav.Link>
          </Nav>
          <Nav>
            {langSwitch}
            <Nav.Link href="/settings">Settings</Nav.Link>
            <Button
              variant="outline-secondary"
              className="ms-2"
              onClick={handleThemeToggle}
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