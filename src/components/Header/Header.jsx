import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, ALargeSmall, LogOut, ScrollText } from 'lucide-react';
import ConfirmModal from '../Modals/ConfirmModal';
import { useTheme } from '../../context/ThemeContext';
import FontSizeControl from '../Controls/FontSizeControl';
import styles from './Header.module.css';


export default function Header({ onToggleSidebar, onMenuMouseEnter, onMenuMouseLeave, onLogout, showLogsPanel, onToggleLogs, unreadLogsCount = 0, currentStream }) {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showSettings]);

  return (
    <div className={styles.headerWrapper} ref={settingsRef}>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            onClick={onToggleSidebar}
            onMouseEnter={onMenuMouseEnter}
            onMouseLeave={onMenuMouseLeave}
            title="切換側邊欄"
          >
            <Menu size={20} />
          </button>
          <div className={styles.titleGroup}>
            <span className={styles.title}>CMoney 直播管理台</span>
            {currentStream && (
              <span className={styles.streamTitle}>{currentStream.title}</span>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={`${styles.iconBtn} ${showSettings ? styles.active : ''}`}
            onClick={() => setShowSettings(p => !p)}
            title="字體大小"
          >
            <ALargeSmall size={18} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className={styles.logsBtnWrapper}>
            <button
              className={`${styles.iconBtn} ${showLogsPanel ? styles.active : ''}`}
              onClick={onToggleLogs}
              title="管理日誌"
            >
              <ScrollText size={18} />
            </button>
            {unreadLogsCount > 0 && (
              <span className={styles.badge}>{unreadLogsCount > 99 ? '99+' : unreadLogsCount}</span>
            )}
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={16} />
            <span>登出</span>
          </button>
        </div>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <FontSizeControl />
        </div>
      )}

      {showLogoutModal && (
        <ConfirmModal
          title="登出"
          message="確定要登出嗎？"
          onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
