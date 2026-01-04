import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@dark');
        if (saved !== null) setDark(JSON.parse(saved));
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@dark', JSON.stringify(dark));
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  const colors = {
    background: dark ? '#121212' : '#f5f5f5',
    card: dark ? '#1e1e1e' : 'white',
    text: dark ? '#ffffff' : '#000000',
    primary: '#1E90FF',
    error: dark ? '#cf6679' : 'red',
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);