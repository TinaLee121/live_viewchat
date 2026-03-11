import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { initialMessages, nextMsgId, CURRENT_USER_ID, users } from '../data/mockData';

const ChatContext = createContext(null);

const MAX_MESSAGES = 500;
const TRIM_COUNT = 100;

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(initialMessages);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mutedUsers, setMutedUsers] = useState({});   // { [userId]: unmuteTimestamp }
  const [adminLogs, setAdminLogs] = useState([]);

  // --- Batching state ---
  const batchBuffer = useRef([]);
  const flushTimer = useRef(null);
  const msgRateWindow = useRef([]); // timestamps within last 1s

  // ---- Helpers ----
  const addLog = useCallback((entry) => {
    setAdminLogs(prev => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        actorName: users[CURRENT_USER_ID]?.name || '主播',
        ...entry,
      },
      ...prev,
    ].slice(0, 200));
  }, []);

  const flushBatch = useCallback(() => {
    if (batchBuffer.current.length === 0) {
      clearInterval(flushTimer.current);
      flushTimer.current = null;
      return;
    }
    const batch = batchBuffer.current.splice(0);
    setMessages(prev => {
      const next = [...prev, ...batch];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
  }, []);

  // ---- Message actions ----
  const addMessage = useCallback((msg) => {
    const now = Date.now();
    // sliding window: keep only timestamps within last 1 second
    msgRateWindow.current = msgRateWindow.current.filter(t => now - t < 1000);
    msgRateWindow.current.push(now);
    const rate = msgRateWindow.current.length;

    if (rate > 5) {
      batchBuffer.current.push(msg);
      if (!flushTimer.current) {
        flushTimer.current = setInterval(flushBatch, 200);
      }
    } else {
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      });
    }
  }, [flushBatch]);

  const sendMessage = useCallback((text) => {
    const id = nextMsgId();
    const pending = {
      id,
      userId: CURRENT_USER_ID,
      text,
      timestamp: new Date(),
      status: 'pending',
      removed: false,
      pinned: false,
    };
    setMessages(prev => [...prev, pending]);

    const willFail = Math.random() < 0.1;
    const delay = 600 + Math.random() * 400;

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === id ? { ...m, status: willFail ? 'failed' : 'sent' } : m
        )
      );
    }, delay);

    return { id, willFail };
  }, []);

  const retryMessage = useCallback((msg) => {
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    sendMessage(msg.text);
  }, [sendMessage]);

  const removeMessage = useCallback((msgId) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, removed: true } : m)
    );
    setPinnedMessage(prev => prev?.id === msgId ? null : prev);
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
      const target = users[msg.userId];
      addLog({ action: 'remove', targetName: target?.name || '未知', detail: msg.text.slice(0, 20) });
    }
  }, [messages, addLog]);

  const kickUser = useCallback((userId) => {
    setMessages(prev =>
      prev.map(m => m.userId === userId ? { ...m, removed: true } : m)
    );
    setPinnedMessage(prev => prev?.userId === userId ? null : prev);
    const target = users[userId];
    addLog({ action: 'kick', targetName: target?.name || '未知', detail: '' });
  }, [addLog]);

  const muteUser = useCallback((userId, durationMs = 60000) => {
    const unmuteAt = Date.now() + durationMs;
    setMutedUsers(prev => ({ ...prev, [userId]: unmuteAt }));
    const target = users[userId];
    addLog({ action: 'mute', targetName: target?.name || '未知', detail: `${durationMs / 1000}秒` });
    setTimeout(() => {
      setMutedUsers(prev => {
        const next = { ...prev };
        if (next[userId] && next[userId] <= Date.now() + 100) {
          delete next[userId];
        }
        return next;
      });
    }, durationMs);
  }, [addLog]);

  const pinMessage = useCallback((msg) => {
    setPinnedMessage(prev => prev?.id === msg.id ? null : msg);
  }, []);

  const prependMessages = useCallback((msgs) => {
    setMessages(prev => [...msgs, ...prev]);
  }, []);

  const appendReconnectMessages = useCallback((msgs) => {
    setMessages(prev => {
      const next = [...prev, ...msgs];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
  }, []);

  const trimOldMessages = useCallback(() => {
    setMessages(prev =>
      prev.length > MAX_MESSAGES ? prev.slice(TRIM_COUNT) : prev
    );
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      pinnedMessage,
      fontSize,
      setFontSize,
      isSyncing,
      setIsSyncing,
      mutedUsers,
      adminLogs,
      addMessage,
      sendMessage,
      retryMessage,
      removeMessage,
      kickUser,
      muteUser,
      pinMessage,
      prependMessages,
      appendReconnectMessages,
      trimOldMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
