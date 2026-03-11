import { useRef, useState, useEffect, useCallback } from 'react';
import { Pin, PinOff } from 'lucide-react';
import { usePointerMode } from '../../hooks/usePointerMode';
import AppList from './AppList';
import AdminLogs from '../Admin/AdminLogs';
import styles from './Sidebar.module.css';

const DEBOUNCE_MS = 200;
const COLLAPSE_DELAY = 300;

export default function Sidebar({ forceOpen, onOverlayClick }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'logs'
  const pointerMode = usePointerMode();
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    if (pointerMode === 'touch') {
      setOpen(forceOpen);
    }
  }, [forceOpen, pointerMode]);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const handleMouseEnter = useCallback(() => {
    if (pointerMode !== 'mouse') return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), DEBOUNCE_MS);
  }, [pointerMode]);

  const handleMouseLeave = useCallback(() => {
    if (pointerMode !== 'mouse') return;
    if (pinned) return;
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), COLLAPSE_DELAY);
  }, [pointerMode, pinned]);

  const isVisible = pointerMode === 'mouse' ? (open || pinned) : open;

  return (
    <>
      {pointerMode === 'touch' && open && (
        <div className={styles.overlay} onClick={() => {
          setOpen(false);
          if (onOverlayClick) onOverlayClick();
        }} />
      )}

      <aside
        className={`${styles.sidebar} ${isVisible ? styles.open : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'apps' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('apps')}
            >
              應用程式
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'logs' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              管理日誌
            </button>
          </div>
          {pointerMode === 'mouse' && (
            <button
              className={`${styles.pinBtn} ${pinned ? styles.pinned : ''}`}
              onClick={() => setPinned(p => !p)}
              title={pinned ? '取消釘選側邊欄' : '釘選側邊欄'}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
        </div>

        <div className={styles.content}>
          {activeTab === 'apps' ? <AppList /> : <AdminLogs />}
        </div>
      </aside>

      {pointerMode === 'mouse' && !isVisible && (
        <div
          className={styles.triggerStrip}
          onMouseEnter={handleMouseEnter}
        />
      )}
    </>
  );
}
