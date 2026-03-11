import { useChat } from '../../context/ChatContext';
import styles from './AdminLogs.module.css';

const ACTION_LABELS = {
  remove: '刪除訊息',
  kick: '踢出用戶',
  mute: '禁言',
};

export default function AdminLogs() {
  const { adminLogs } = useChat();

  if (adminLogs.length === 0) {
    return <div className={styles.empty}>尚無管理記錄</div>;
  }

  return (
    <div className={styles.list}>
      {adminLogs.map(log => (
        <div key={log.id} className={`${styles.entry} ${styles[log.action]}`}>
          <div className={styles.top}>
            <span className={`${styles.badge} ${styles[log.action]}`}>
              {ACTION_LABELS[log.action] || log.action}
            </span>
            <span className={styles.time}>
              {new Date(log.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className={styles.detail}>
            <span className={styles.actor}>{log.actorName}</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.target}>{log.targetName}</span>
            {log.detail && <span className={styles.extra}>（{log.detail}）</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
