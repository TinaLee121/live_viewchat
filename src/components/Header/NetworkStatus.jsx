import styles from './NetworkStatus.module.css';

export default function NetworkStatus({ status }) {
  if (status === 'online') return null;

  const isOffline = status === 'offline';
  return (
    <div className={`${styles.bar} ${isOffline ? styles.offline : styles.reconnected}`}>
      {isOffline
        ? '網路連線中斷，可能無法接收最新訊息'
        : '網路已恢復'}
    </div>
  );
}
