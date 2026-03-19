import { useState, useRef } from 'react';
import { Trash2, UserX, Pin, PinOff, RotateCcw } from 'lucide-react';
import { users, CURRENT_USER_ID, ROLES } from '../../data/mockData';
import { useLongPress } from '../../hooks/useLongPress';
import ConfirmModal from '../Modals/ConfirmModal';
import ActionSheet from '../Modals/ActionSheet';
import styles from './MessageBubble.module.css';

const AVATAR_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function formatTime(date) {
  return new Date(date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({
  message, fontSize, onRemove, onHide, onPin, onRetry, isPinned,
}) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const wrapperRef = useRef(null);

  const user = users[message.userId];
  const isOwn = message.userId === CURRENT_USER_ID;
  const isStreamer = user?.role === ROLES.STREAMER;
  const avatarColor = AVATAR_COLORS[message.userId % AVATAR_COLORS.length];
  const avatarChar = (user?.name || '?')[0];

  const iconSize = Math.round(13 * fontSize / 14);

  const longPress = useLongPress(() => {
    if (!message.removed && message.status !== 'pending') {
      setShowActionSheet(true);
    }
  }, 500);

  // ---- Confirm flows ----
  const handleRemoveClick = () => {
    setConfirmAction({ type: 'remove' });
  };

  const handleHideClick = () => {
    setConfirmAction({ type: 'hide' });
  };

  const handleConfirm = () => {
    if (confirmAction?.type === 'remove') onRemove(message.id);
    if (confirmAction?.type === 'hide') onHide(message.userId);
    setConfirmAction(null);
  };

  // ActionSheet callbacks (go through confirm for destructive)
  const handleSheetRemove = () => setConfirmAction({ type: 'remove' });
  const handleSheetHide = () => setConfirmAction({ type: 'hide' });

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
        style={{ '--msg-font-size': `${fontSize}px` }}
        onContextMenu={(e) => e.preventDefault()}
        {...longPress}
      >
        {/* Row 1: avatar + meta */}
        <div className={styles.msgHeader}>
          <div className={styles.avatar} style={{ background: avatarColor }}>
            {avatarChar}
          </div>
          <div className={styles.nameRow}>
            <span className={`${styles.name} ${isStreamer ? styles.streamerName : ''}`}>
              {user?.name || '未知用戶'}
            </span>
            {isStreamer && <span className={styles.streamerBadge}>主播</span>}
            {message.status === 'pending' && <span className={styles.statusLabel}>傳送中...</span>}
            {message.status === 'failed' && <span className={styles.failLabel}>傳送失敗</span>}
          </div>
        </div>

        {/* Row 2: bubble + retry + time + actions */}
        <div className={styles.bubbleRow}>
          <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
            <p className={styles.text}>{message.text}</p>
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

          <div className={styles.timeWrapper}>
            <span className={styles.time}>{formatTime(message.timestamp)}</span>
          </div>

          {message.status !== 'pending' && (
            <div className={styles.actionsWrapper}>
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); onPin(message); }}
                title={isPinned ? '取消釘選' : '釘選'}
              >
                {isPinned ? <PinOff size={iconSize} /> : <Pin size={iconSize} />}
              </button>
              {!isOwn && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => { e.stopPropagation(); handleRemoveClick(); }}
                    title="刪除訊息"
                  >
                    <Trash2 size={iconSize} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => { e.stopPropagation(); handleHideClick(); }}
                    title="隱藏用戶"
                  >
                    <UserX size={iconSize} />
                  </button>
                </>
              )}
            </div>
            </div>
          )}
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'hide' ? '隱藏用戶' : '刪除訊息'}
          message={
            confirmAction.type === 'hide'
              ? `確定要隱藏「${user?.name}」嗎？\n該用戶的訊息將對所有人隱藏。`
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
          onHide={handleSheetHide}
          onClose={() => setShowActionSheet(false)}
        />
      )}
    </>
  );
}
