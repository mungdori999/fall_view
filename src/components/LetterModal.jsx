import { useState } from "react";
import { sendMessage } from "./memberApi";

const MAX_MESSAGE_LENGTH = 250;

function LetterModal({ onClose, onSent, recipients, remainingMessageCount }) {
  const [receiverMemberId, setReceiverMemberId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!receiverMemberId || !senderName.trim() || !content.trim() || isSending) return;

    setIsSending(true);
    setError("");
    try {
      await sendMessage({
        receiverMemberId: Number(receiverMemberId),
        senderName: senderName.trim(),
        content: content.trim(),
      });
      onSent();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="letter-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        <div className="modal-leaf">🍁</div>
        <p className="eyebrow">A LITTLE NOTE</p>
        <h2 id="letter-title">
          누구에게 마음을
          <br />
          전하고 싶나요?
        </h2>
        <p className="modal-message-count">
          남은 쪽지 <strong>{remainingMessageCount}</strong>장
        </p>
        <select aria-label="받는 사람" value={receiverMemberId} onChange={(event) => setReceiverMemberId(event.target.value)} disabled={recipients.length === 0 || isSending}>
          <option>받는 사람을 선택해주세요</option>
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </select>
        <input
          className="sender-name-input"
          type="text"
          placeholder="상대방에게 보여질 내 이름"
          maxLength="30"
          value={senderName}
          onChange={(event) => setSenderName(event.target.value)}
          disabled={isSending}
        />
        <textarea
          placeholder="부담 없이, 당신의 마음을 적어주세요."
          maxLength={MAX_MESSAGE_LENGTH}
          value={content}
          onChange={(event) => setContent(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          disabled={isSending}
        />
        <p className="message-length-guide" aria-live="polite">
          {content.length} / {MAX_MESSAGE_LENGTH}자
        </p>
        {error && <p className="letter-send-error" role="alert">{error}</p>}
        <button
          className="send"
          disabled={!receiverMemberId || !senderName.trim() || !content.trim() || recipients.length === 0 || remainingMessageCount < 1 || isSending}
          onClick={handleSend}
        >
          {isSending ? "보내는 중…" : "보내기"}
        </button>
      </div>
    </div>
  );
}

export default LetterModal;
