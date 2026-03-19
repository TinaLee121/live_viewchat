import { Sun, Moon, LogIn } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLogin }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.page}>
      <button className={styles.themeBtn} onClick={toggleTheme} title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoC}>C</span>
          <span className={styles.logoMoney}>Money</span>
        </div>
        <h1 className={styles.title}>直播管理台</h1>
        <p className={styles.subtitle}>請使用 CMoney 帳號登入以繼續</p>

        <button className={styles.loginBtn} onClick={onLogin}>
          <LogIn size={18} />
          使用 CMoney 帳號登入
        </button>

        <p className={styles.hint}>登入即代表您同意 CMoney 服務條款與隱私政策</p>
      </div>
    </div>
  );
}
