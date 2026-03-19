import { useRef, useEffect, useState, useCallback, Fragment } from 'react';
import { ChevronDown, Loader } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { historyMessages, nextMsgId } from '../../data/mockData';
import MessageBubble from './MessageBubble';
import styles from './ChatArea.module.css';

const BOTTOM_THRESHOLD = 80;
const HISTORY_TRIGGER = 60;

export default function ChatArea() {
  const {
    messages, pinnedMessage, fontSize, isSyncing,
    removeMessage, hideUser, pinMessage, retryMessage,
    prependMessages, trimOldMessages,
  } = useChat();

  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const prevScrollHeight = useRef(0);
  const wasAtBottomRef = useRef(true);
  const unreadDividerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
      setNewCount(0);
      // DOM recycling: trim when at bottom and too many messages
      if (messages.length > 500) trimOldMessages();
    } else {
      setNewCount(prev => prev + 1);
      setFirstUnreadId(prev => prev ?? messages[messages.length - 1]?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distFromBottom < BOTTOM_THRESHOLD;

    // New session: user scrolled up from bottom → clear previous unread divider
    if (!atBottom && wasAtBottomRef.current) {
      setFirstUnreadId(null);
    }
    wasAtBottomRef.current = atBottom;

    setIsAtBottom(atBottom);
    if (atBottom) setNewCount(0);

    if (el.scrollTop < HISTORY_TRIGGER && !isLoadingHistory && !historyLoaded) {
      loadHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingHistory, historyLoaded]);

  const loadHistory = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setIsLoadingHistory(true);
    prevScrollHeight.current = el.scrollHeight;

    setTimeout(() => {
      const newMsgs = historyMessages.map((m, i) => ({ ...m, id: nextMsgId() + i }));
      prependMessages(newMsgs);
      setHistoryLoaded(true);
      setIsLoadingHistory(false);

      requestAnimationFrame(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - prevScrollHeight.current;
      });
    }, 1000);
  }, [prependMessages]);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      setNewCount(0);
      setIsAtBottom(true);
    }
  };

  const scrollToUnread = () => {
    if (unreadDividerRef.current) {
      unreadDividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setNewCount(0);
    } else {
      scrollToBottom();
    }
  };

  return (
    <div className={styles.wrapper}>
      {isLoadingHistory && (
        <div className={styles.historyLoading}>
          <Loader size={14} className={styles.spin} />
          載入歷史訊息...
        </div>
      )}

      <div
        ref={containerRef}
        className={styles.container}
        onScroll={handleScroll}
      >
        {isSyncing && (
          <div className={styles.syncing}>
            <Loader size={16} className={styles.spin} />
            正在同步訊息...
          </div>
        )}

        {messages.filter(msg => !msg.hidden).map(msg => (
          <Fragment key={msg.id}>
            {firstUnreadId === msg.id && (
              <div ref={unreadDividerRef} className={styles.unreadDivider}>
                <span className={styles.unreadLabel}>以下為未讀訊息</span>
              </div>
            )}
            <MessageBubble
              message={msg}
              fontSize={fontSize}
              onRemove={removeMessage}
              onHide={hideUser}
              onPin={pinMessage}
              onRetry={retryMessage}
              isPinned={pinnedMessage?.id === msg.id}
            />
          </Fragment>
        ))}
      </div>

      {!isAtBottom && newCount > 0 && (
        <button className={styles.newMsgBtn} onClick={scrollToUnread}>
          <ChevronDown size={15} />
          {newCount} 則新訊息
        </button>
      )}

      {!isAtBottom && newCount === 0 && (
        <button className={styles.scrollBottomBtn} onClick={scrollToBottom} title="回到底部">
          <ChevronDown size={16} />
        </button>
      )}
    </div>
  );
}
