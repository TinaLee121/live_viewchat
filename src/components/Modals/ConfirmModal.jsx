import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ title, message, preview, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); onConfirm(); }
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>
          <AlertTriangle size={28} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {preview && (
          <div className={styles.preview}>{preview}</div>
        )}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>取消</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>確認</button>
        </div>
      </div>
    </div>
  );
}
