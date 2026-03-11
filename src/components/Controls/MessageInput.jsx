import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import styles from './MessageInput.module.css';

const DRAFT_KEY = 'live_chatview_draft';

export default function MessageInput({ networkStatus }) {
  const { sendMessage } = useChat();
  const [text, setText] = useState(() => localStorage.getItem(DRAFT_KEY) || '');
  const [failMsg, setFailMsg] = useState(false);
  const textareaRef = useRef(null);

  const isOffline = networkStatus === 'offline';

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (val) {
      localStorage.setItem(DRAFT_KEY, val);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isOffline) return;
    setText('');
    localStorage.removeItem(DRAFT_KEY);
    setFailMsg(false);

    const { willFail } = sendMessage(trimmed);
    if (willFail) {
      setTimeout(() => setFailMsg(true), 1100);
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      {failMsg && (
        <div className={styles.failNotice}>
          傳送失敗，請稍後再試
          <button onClick={() => setFailMsg(false)} className={styles.dismissBtn}>×</button>
        </div>
      )}
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={isOffline ? '離線中 — 草稿已暫存' : '輸入訊息… (Enter 發送)'}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isOffline}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!text.trim() || isOffline}
          title="發送 (Enter)"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
