import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Radio, Menu, Settings2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import FontSizeControl from '../Controls/FontSizeControl';
import styles from './Header.module.css';

function PingDot({ ping }) {
  if (ping === null) return null;
  const cls = ping < 100 ? styles.pingGood : ping < 300 ? styles.pingMid : styles.pingBad;
  return (
    <div className={`${styles.ping} ${cls}`} title={`延遲 ${ping}ms`}>
      <span className={styles.pingDot} />
      <span className={styles.pingMs}>{ping}ms</span>
    </div>
  );
}

export default function Header({ onEndLive, onToggleSidebar, ping }) {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
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
          <button className={styles.menuBtn} onClick={onToggleSidebar} title="切換側邊欄">
            <Menu size={20} />
          </button>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            直播中
          </div>
          <span className={styles.title}>CMoney 直播管理台</span>
        </div>

        <div className={styles.right}>
          <PingDot ping={ping} />
          <button
            className={`${styles.iconBtn} ${showSettings ? styles.active : ''}`}
            onClick={() => setShowSettings(p => !p)}
            title="設定"
          >
            <Settings2 size={18} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={styles.endLiveBtn} onClick={onEndLive}>
            <Radio size={15} />
            關閉直播
          </button>
        </div>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <FontSizeControl />
        </div>
      )}
    </div>
  );
}
