import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import CarparkDetail from './components/Carparkdetail';
import { Routes, Route } from 'react-router-dom'; // 不要再 import Router

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'enabled');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
  }, [darkMode]);

  return (
    <>
      <Header
        currentLang={lang}
        onLangChange={setLang}
        onThemeToggle={() => setDarkMode((prev) => !prev)}
        darkMode={darkMode}
      />
      <Routes>
        <Route path="/" element={<Main lang={lang} darkMode={darkMode} />} />
        <Route path="/info/:park_id" element={<CarparkDetail lang={lang} />} />
      </Routes>
    </>
  );
}

export default App;