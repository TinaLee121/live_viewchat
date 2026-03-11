import { Pin, X } from 'lucide-react';
import { users } from '../../data/mockData';
import styles from './PinnedMessage.module.css';

export default function PinnedMessage({ message, onUnpin }) {
  if (!message) return null;
  const user = users[message.userId];

  return (
    <div className={styles.pinned}>
      <Pin size={13} className={styles.icon} />
      <div className={styles.content}>
        <span className={styles.name}>{user?.name}</span>
        <span className={styles.text}>{message.text}</span>
      </div>
      <button className={styles.close} onClick={onUnpin} title="取消釘選">
        <X size={14} />
      </button>
    </div>
  );
}
