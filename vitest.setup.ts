import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Мокаем window.WebApp для тестов Telegram SDK
vi.stubGlobal('WebApp', {
  ready: vi.fn(),
  expand: vi.fn(),
});

// Мокаем fetch для тестов
global.fetch = vi.fn();

// Настройка jsdom для корректной работы с DOM
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };
}