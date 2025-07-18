import WebApp from '@twa-dev/sdk';

/**
 * Инициализирует Telegram WebApp SDK.
 */
export function initTelegramSDK() {
  if (typeof window !== 'undefined' && WebApp) {
    try {
      WebApp.ready();
      WebApp.expand();
      console.log('Telegram SDK initialized');
    } catch (err) {
      console.error('Telegram SDK init failed:', err);
    }
  }
}
