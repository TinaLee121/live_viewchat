import { useChat } from '../../context/ChatContext';
import styles from './AdminLogs.module.css';

const ACTION_LABELS = {
  remove: '刪除訊息',
  hide: '隱藏用戶',
};

export default function AdminLogs({ filter = 'all' }) {
  const { adminLogs } = useChat();
  const filtered = filter === 'all' ? adminLogs : adminLogs.filter(log => log.action === filter);

  if (filtered.length === 0) {
    return <div className={styles.empty}>{adminLogs.length === 0 ? '尚無管理記錄' : '此類別尚無紀錄'}</div>;
  }

  return (
    <div className={styles.list}>
      {filtered.map(log => (
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
            <div className={styles.detailRow}>
              <span className={styles.actor}>{log.actorName}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.target}>{log.targetName}</span>
            </div>
            {log.detail && <span className={styles.extra}>「{log.detail}」</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
