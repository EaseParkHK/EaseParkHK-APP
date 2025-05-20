import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
// ...其他 import...

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
      <Main lang={lang} darkMode={darkMode} />
      {/* 其他頁面也傳 darkMode */}
    </>
  );
}

export default App;