import { themeStore, themeActions } from '../stores/theme';
import { FiSun, FiMoon } from 'solid-icons/fi';

export default function ThemeToggle() {
  return (
    <button
      onClick={themeActions.toggleTheme}
      class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {themeStore.isDark ? (
        <FiSun class="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon class="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}
