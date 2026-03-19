import { Radio, CircleDot } from 'lucide-react';
import { streams } from '../../data/mockData';
import styles from './StreamList.module.css';

export default function StreamList({ appId, onSelectStream, currentStreamId }) {
  const list = streams[appId] || [];

  return (
    <div className={styles.list}>
      {list.map(stream => (
        <div
          key={stream.id}
          className={`${styles.item} ${stream.live ? styles.liveItem : styles.offlineItem} ${currentStreamId === stream.id ? styles.active : ''}`}
          onClick={() => stream.live && onSelectStream?.(stream)}
        >
          {stream.live
            ? <Radio size={12} className={styles.liveIcon} />
            : <CircleDot size={12} className={styles.offIcon} />
          }
          <span className={styles.title}>{stream.title}</span>
          {stream.live && <span className={styles.liveBadge}>LIVE</span>}
        </div>
      ))}
    </div>
  );
}
