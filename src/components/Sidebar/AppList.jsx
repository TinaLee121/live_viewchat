import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { apps } from '../../data/mockData';
import StreamList from './StreamList';
import styles from './AppList.module.css';

export default function AppList() {
  const [expandedApp, setExpandedApp] = useState(null);

  const toggle = (id) => setExpandedApp(prev => prev === id ? null : id);

  return (
    <div className={styles.list}>
      <div className={styles.sectionLabel}>應用程式</div>
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
          </button>
          {expandedApp === app.id && <StreamList appId={app.id} />}
        </div>
      ))}
    </div>
  );
}
