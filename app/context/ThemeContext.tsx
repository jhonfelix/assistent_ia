"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Recupera o tema do localStorage ou do sistema operacional
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const expiration = localStorage.getItem("themeExpiration");

      if (savedTheme && expiration) {
        const now = new Date().getTime();
        if (now < parseInt(expiration, 10)) {
          setTheme(savedTheme as Theme); // Restaura o tema se ainda estiver válido
        } else {
          localStorage.removeItem("theme"); // Remove o tema expirado
          localStorage.removeItem("themeExpiration");
        }
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light"); // Define o tema com base no sistema operacional
      }
    }
  }, []);

  // Salva o tema no localStorage com validade de 1 mês
  useEffect(() => {
    if (typeof window !== "undefined") {
      const expiration = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 1 mês em milissegundos
      localStorage.setItem("theme", theme);
      localStorage.setItem("themeExpiration", expiration.toString());
      document.documentElement.className = theme; // Aplica a classe no <html>
    }
  }, [theme]);

  // Alterna entre os temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};