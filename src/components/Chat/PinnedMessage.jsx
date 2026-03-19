import { Pin, X } from 'lucide-react';
import { users } from '../../data/mockData';
import { useChat } from '../../context/ChatContext';
import styles from './PinnedMessage.module.css';

export default function PinnedMessage({ message, onUnpin }) {
  const { fontSize } = useChat();
  if (!message) return null;
  const user = users[message.userId];
  const scale = fontSize / 14;

  return (
    <div className={styles.pinned}>
      <Pin size={Math.round(13 * scale)} className={styles.icon} />
      <div className={styles.content}>
        <span className={styles.name}>{user?.name}</span>
        <span className={styles.text}>{message.text}</span>
      </div>
      <button className={styles.close} onClick={onUnpin} title="取消釘選">
        <X size={Math.round(14 * scale)} />
      </button>
    </div>
  );
}
