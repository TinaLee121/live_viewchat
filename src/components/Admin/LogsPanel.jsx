import { useState } from 'react';
import { X } from 'lucide-react';
import AdminLogs from './AdminLogs';
import styles from './LogsPanel.module.css';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'remove', label: '刪除訊息' },
  { key: 'hide', label: '隱藏用戶' },
];

export default function LogsPanel({ onClose }) {
  const [filter, setFilter] = useState('all');

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>管理日誌</span>
            <span className={styles.subtitle}>當前直播</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="關閉">
            <X size={14} />
          </button>
        </div>
        <div className={styles.chips}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`${styles.chip} ${filter === f.key ? styles.chipActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <AdminLogs filter={filter} />
      </div>
    </aside>
  );
}
