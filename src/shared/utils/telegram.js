export function initTelegramSDK() {
  if (typeof window !== 'undefined' && window.WebApp) {
    try {
      window.WebApp.ready();
      window.WebApp.expand();
      console.log('Telegram SDK initialized');
    } catch (err) {
      console.error('Telegram SDK init failed:', err);
    }
  }
}
