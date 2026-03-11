import { Pin, PinOff, Trash2, UserX, VolumeX } from 'lucide-react';
import styles from './ActionSheet.module.css';

export default function ActionSheet({ message, user, isPinned, isOwn, onPin, onRemove, onKick, onMute, onClose }) {
  const handle = (fn) => () => { fn(); onClose(); };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.info}>
          <span className={styles.userName}>{user?.name || '未知用戶'}</span>
          <span className={styles.msgPreview}>{message.text.slice(0, 40)}{message.text.length > 40 ? '…' : ''}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handle(() => onPin(message))}>
            {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
            <span>{isPinned ? '取消釘選' : '釘選訊息'}</span>
          </button>
          {!isOwn && (
            <>
              <button className={`${styles.actionBtn} ${styles.warn}`} onClick={handle(() => onMute(message.userId))}>
                <VolumeX size={18} />
                <span>禁言 60 秒</span>
              </button>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={handle(() => onRemove(message))}>
                <Trash2 size={18} />
                <span>刪除訊息</span>
              </button>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={handle(() => onKick(message))}>
                <UserX size={18} />
                <span>踢出用戶</span>
              </button>
            </>
          )}
        </div>
        <button className={styles.cancelBtn} onClick={onClose}>取消</button>
      </div>
    </div>
  );
}
