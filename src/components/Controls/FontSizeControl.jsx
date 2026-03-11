import { Type } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import styles from './FontSizeControl.module.css';

const MIN = 12;
const MAX = 24;

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useChat();

  return (
    <div className={styles.wrapper}>
      <Type size={14} className={styles.icon} />
      <span className={styles.label}>字體</span>
      <input
        type="range"
        min={MIN}
        max={MAX}
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
        className={styles.slider}
      />
      <span className={styles.value}>{fontSize}px</span>
    </div>
  );
}
