export const initializeApp = async () => {
  if (window.Telegram && window.Telegram.WebApp) {
    const initData = window.Telegram.WebApp.initData;
    const token = await loginUser(initData);
    localStorage.setItem('jwt', token);
    return true;
  }
  return false;
};