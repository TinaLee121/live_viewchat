import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { apps, streams } from '../../data/mockData';
import StreamList from './StreamList';
import styles from './AppList.module.css';

export default function AppList({ onSelectStream, currentStreamId }) {
  const [expandedApp, setExpandedApp] = useState(null);

  const toggle = (id) => setExpandedApp(prev => prev === id ? null : id);

  return (
    <div className={styles.list}>
      {apps.map(app => (
        <div key={app.id}>
          <button
            className={`${styles.appItem} ${expandedApp === app.id ? styles.expanded : ''}`}
            onClick={() => toggle(app.id)}
          >
            <ChevronRight
              size={14}
              className={`${styles.chevron} ${expandedApp === app.id ? styles.open : ''}`}
            />
            <span className={styles.appName}>{app.name}</span>
            {streams[app.id]?.some(s => s.live) && (
              <span className={styles.liveBadge}>LIVE</span>
            )}
          </button>
          {expandedApp === app.id && (
            <StreamList
              appId={app.id}
              onSelectStream={onSelectStream}
              currentStreamId={currentStreamId}
            />
          )}
        </div>
      ))}
    </div>
  );
}
