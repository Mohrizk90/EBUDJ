import { createStore } from 'solid-js/store';

interface ThemeState {
  isDark: boolean;
}

// Check localStorage and system preference
const getInitialTheme = (): boolean => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const [themeStore, setThemeStore] = createStore<ThemeState>({
  isDark: getInitialTheme(),
});

export const themeActions = {
  toggleTheme() {
    const newTheme = !themeStore.isDark;
    setThemeStore('isDark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Update DOM
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  initTheme() {
    // Apply theme on initial load
    if (themeStore.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
};
