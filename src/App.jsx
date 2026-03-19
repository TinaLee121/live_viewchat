import { useState, useCallback, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { usePing } from './hooks/usePing';
import Header from './components/Header/Header';
import NetworkStatus from './components/Header/NetworkStatus';
import Sidebar from './components/Sidebar/Sidebar';
import PinnedMessage from './components/Chat/PinnedMessage';
import ChatArea from './components/Chat/ChatArea';
import MessageInput from './components/Controls/MessageInput';
import LogsPanel from './components/Admin/LogsPanel';
import { randomMessages, reconnectMessages, nextMsgId, streams } from './data/mockData';
import styles from './App.module.css';

function LiveApp({ onLogout }) {
  const { addMessage, appendReconnectMessages, setIsSyncing, pinMessage, pinnedMessage, fontSize, adminLogs, resetMessages } = useChat();
  const [sidebarForceOpen, setSidebarForceOpen] = useState(false);
  const [sidebarMenuHover, setSidebarMenuHover] = useState(false);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [currentStream, setCurrentStream] = useState(() => {
    // Default to first live stream found
    for (const appStreams of Object.values(streams)) {
      const live = appStreams.find(s => s.live);
      if (live) return live;
    }
    return null;
  });
  const lastSeenLogsCount = useRef(0);
  const msgIndexRef = useRef(0);
  const ping = usePing();

  // Simulate incoming messages every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const factory = randomMessages[msgIndexRef.current % randomMessages.length];
      addMessage(factory(nextMsgId()));
      msgIndexRef.current++;
    }, 3000);
    return () => clearInterval(timer);
  }, [addMessage]);

  // Keyboard avoidance for mobile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handler = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${Math.max(0, offset)}px`
      );
    };

    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

  const handleSelectStream = useCallback((stream) => {
    setCurrentStream(stream);
    resetMessages();
    setSidebarForceOpen(false);
  }, [resetMessages]);

  const handleReconnect = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      const msgs = reconnectMessages.map((f, i) => f(nextMsgId() + i));
      appendReconnectMessages(msgs);
      setIsSyncing(false);
    }, 1500);
  }, [setIsSyncing, appendReconnectMessages]);

  const networkStatus = useNetworkStatus(handleReconnect);

  return (
    <div className={styles.app} style={{ '--font-scale': fontSize / 14 }}>
      <div className={styles.topBar}>
        <NetworkStatus status={networkStatus} />
        <Header
          onToggleSidebar={() => setSidebarForceOpen(p => !p)}
          onMenuMouseEnter={() => setSidebarMenuHover(true)}
          onMenuMouseLeave={() => setSidebarMenuHover(false)}
          onLogout={onLogout}
          ping={ping}
          currentStream={currentStream}
          showLogsPanel={showLogsPanel}
          unreadLogsCount={showLogsPanel ? 0 : adminLogs.length - lastSeenLogsCount.current}
          onToggleLogs={() => {
            setShowLogsPanel(p => {
              if (!p) lastSeenLogsCount.current = adminLogs.length;
              return !p;
            });
          }}
        />
      </div>

      <div className={styles.body}>
        <Sidebar
          forceOpen={sidebarForceOpen}
          menuHover={sidebarMenuHover}
          onOverlayClick={() => setSidebarForceOpen(false)}
          onSelectStream={handleSelectStream}
          currentStreamId={currentStream?.id}
          onLogout={onLogout}
        />

        <main className={styles.main}>
          {pinnedMessage && (
            <PinnedMessage
              message={pinnedMessage}
              onUnpin={() => pinMessage(pinnedMessage)}
            />
          )}
          <ChatArea />
          <MessageInput networkStatus={networkStatus} />
        </main>

        {showLogsPanel && <LogsPanel onClose={() => setShowLogsPanel(false)} />}
      </div>

    </div>
  );
}

export default function App({ onLogout }) {
  return (
    <ChatProvider>
      <LiveApp onLogout={onLogout} />
    </ChatProvider>
  );
}
