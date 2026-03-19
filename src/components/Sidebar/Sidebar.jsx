import { useRef, useState, useEffect, useCallback } from 'react';
import { Pin, PinOff, LogOut } from 'lucide-react';
import { usePointerMode } from '../../hooks/usePointerMode';
import AppList from './AppList';
import styles from './Sidebar.module.css';

const DEBOUNCE_MS = 200;
const COLLAPSE_DELAY = 300;

export default function Sidebar({ forceOpen, menuHover, onOverlayClick, onSelectStream, currentStreamId, onLogout }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const pointerMode = usePointerMode();
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const sidebarHoveredRef = useRef(false);

  // forceOpen (click): touch mode controls open, mouse mode toggles pin and open
  useEffect(() => {
    if (pointerMode === 'touch') {
      setOpen(forceOpen);
    } else {
      if (forceOpen) {
        setPinned(true);
        setOpen(true);
      } else {
        setPinned(false);
        setOpen(false);
      }
    }
  }, [forceOpen, pointerMode]);

  // menuHover: mouse hovering over Header menu button opens/closes sidebar
  useEffect(() => {
    if (pointerMode !== 'mouse') return;
    if (menuHover) {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
      setOpen(true);
    } else {
      if (!pinned && !sidebarHoveredRef.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), COLLAPSE_DELAY);
      }
    }
  }, [menuHover, pointerMode, pinned]);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const handleMouseEnter = useCallback(() => {
    if (pointerMode !== 'mouse') return;
    sidebarHoveredRef.current = true;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), DEBOUNCE_MS);
  }, [pointerMode]);

  const handleMouseLeave = useCallback(() => {
    if (pointerMode !== 'mouse') return;
    sidebarHoveredRef.current = false;
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
          <span className={styles.headerTitle}>應用程式清單</span>
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
          <AppList onSelectStream={onSelectStream} currentStreamId={currentStreamId} />
        </div>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={16} />
            <span>登出</span>
          </button>
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
