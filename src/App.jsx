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
import ConfirmModal from './components/Modals/ConfirmModal';
import { randomMessages, reconnectMessages, nextMsgId } from './data/mockData';
import styles from './App.module.css';

function LiveApp() {
  const { addMessage, appendReconnectMessages, setIsSyncing, pinMessage, pinnedMessage } = useChat();
  const [showEndModal, setShowEndModal] = useState(false);
  const [sidebarForceOpen, setSidebarForceOpen] = useState(false);
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
    <div className={styles.app}>
      <div className={styles.topBar}>
        <NetworkStatus status={networkStatus} />
        <Header
          onEndLive={() => setShowEndModal(true)}
          onToggleSidebar={() => setSidebarForceOpen(p => !p)}
          ping={ping}
        />
      </div>

      <div className={styles.body}>
        <Sidebar
          forceOpen={sidebarForceOpen}
          onOverlayClick={() => setSidebarForceOpen(false)}
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
      </div>

      {showEndModal && (
        <ConfirmModal
          title="關閉直播"
          message="確定要關閉直播嗎？關閉後觀眾將無法繼續收看。"
          onConfirm={() => setShowEndModal(false)}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <LiveApp />
      </ChatProvider>
    </ThemeProvider>
  );
}
