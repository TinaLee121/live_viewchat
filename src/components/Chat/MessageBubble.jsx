import { useState, useEffect, useRef } from 'react';
import { Trash2, UserX, Pin, PinOff, RotateCcw, VolumeX } from 'lucide-react';
import { users, CURRENT_USER_ID, ROLES } from '../../data/mockData';
import { useLongPress } from '../../hooks/useLongPress';
import { filterText } from '../../utils/contentFilter';
import ConfirmModal from '../Modals/ConfirmModal';
import ActionSheet from '../Modals/ActionSheet';
import styles from './MessageBubble.module.css';

const AVATAR_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function formatTime(date) {
  return new Date(date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(unmuteAt) {
  const secs = Math.max(0, Math.ceil((unmuteAt - Date.now()) / 1000));
  return `禁言中 ${secs}s`;
}

export default function MessageBubble({
  message, fontSize, onRemove, onKick, onMute, onPin, onRetry, isPinned, muteUntil,
}) {
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!showActions) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showActions]);

  const user = users[message.userId];
  const isOwn = message.userId === CURRENT_USER_ID;
  const isStreamer = user?.role === ROLES.STREAMER;
  const avatarColor = AVATAR_COLORS[message.userId % AVATAR_COLORS.length];
  const avatarChar = (user?.name || '?')[0];

  const longPress = useLongPress(() => {
    if (!message.removed && message.status !== 'pending') {
      setShowActionSheet(true);
    }
  }, 500);

  // ---- Confirm flows ----
  const handleRemoveClick = () => {
    setConfirmAction({ type: 'remove' });
  };

  const handleKickClick = () => {
    setConfirmAction({ type: 'kick' });
  };

  const handleConfirm = () => {
    if (confirmAction?.type === 'remove') onRemove(message.id);
    if (confirmAction?.type === 'kick') onKick(message.userId);
    setConfirmAction(null);
  };

  // ActionSheet callbacks (go through confirm for destructive)
  const handleSheetRemove = () => setConfirmAction({ type: 'remove' });
  const handleSheetKick = () => setConfirmAction({ type: 'kick' });

  if (message.removed) {
    return (
      <div className={`${styles.removed} ${isOwn ? styles.removedOwn : ''}`}>
        該訊息已被移除
      </div>
    );
  }

  const statusClass = message.status === 'pending'
    ? styles.pending
    : message.status === 'failed'
    ? styles.failed
    : '';

  return (
    <>
      <div
        ref={wrapperRef}
        className={`${styles.wrapper} ${isOwn ? styles.own : ''} ${statusClass}`}
        onClick={() => {
          if (message.status !== 'pending') setShowActions(prev => !prev);
        }}
        style={{ '--msg-font-size': `${fontSize}px` }}
        {...longPress}
      >
        {/* Row 1: avatar + meta */}
        <div className={styles.msgHeader}>
          <div className={styles.avatar} style={{ background: avatarColor }}>
            {avatarChar}
          </div>
          <span className={`${styles.name} ${isStreamer ? styles.streamerName : ''}`}>
            {user?.name || '未知用戶'}
          </span>
          {isStreamer && <span className={styles.streamerBadge}>主播</span>}
          {muteUntil && <span className={styles.muteBadge}>{formatCountdown(muteUntil)}</span>}
          <span className={styles.time}>{formatTime(message.timestamp)}</span>
          {message.status === 'pending' && <span className={styles.statusLabel}>傳送中...</span>}
          {message.status === 'failed' && <span className={styles.failLabel}>傳送失敗</span>}
        </div>

        {/* Row 2: actions + bubble */}
        <div className={styles.bubbleRow}>
          {showActions && message.status !== 'pending' && (
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); onPin(message); setShowActions(false); }}
                title={isPinned ? '取消釘選' : '釘選'}
              >
                {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>
              {!isOwn && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.warn}`}
                    onClick={(e) => { e.stopPropagation(); onMute(message.userId); setShowActions(false); }}
                    title="禁言 60 秒"
                  >
                    <VolumeX size={13} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => { e.stopPropagation(); handleRemoveClick(); setShowActions(false); }}
                    title="刪除訊息"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => { e.stopPropagation(); handleKickClick(); setShowActions(false); }}
                    title="踢出用戶"
                  >
                    <UserX size={13} />
                  </button>
                </>
              )}
            </div>
          )}

          <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
            <p className={styles.text}>{filterText(message.text)}</p>
          </div>

          {message.status === 'failed' && onRetry && (
            <button
              className={styles.retryBtn}
              onClick={() => onRetry(message)}
              title="重試傳送"
            >
              <RotateCcw size={13} />
              重試
            </button>
          )}
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'kick' ? '踢出用戶' : '刪除訊息'}
          message={
            confirmAction.type === 'kick'
              ? `確定要踢出「${user?.name}」嗎？該用戶所有訊息將被移除。`
              : '確定要刪除這則訊息嗎？'
          }
          preview={
            confirmAction.type === 'remove'
              ? message.text.slice(0, 60)
              : null
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {showActionSheet && (
        <ActionSheet
          message={message}
          user={user}
          isPinned={isPinned}
          isOwn={isOwn}
          onPin={onPin}
          onRemove={handleSheetRemove}
          onKick={handleSheetKick}
          onMute={onMute}
          onClose={() => setShowActionSheet(false)}
        />
      )}
    </>
  );
}
