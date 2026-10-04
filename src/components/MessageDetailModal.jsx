function MessageDetailModal({ message, counterpartName, label, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <article className="message-detail-modal" role="dialog" aria-modal="true" aria-labelledby="message-detail-title" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="닫기">×</button>
        <div className="modal-leaf">🍁</div>
        <p className="eyebrow">AUTUMN NOTE</p>
        <p className="message-detail-label">{label}</p>
        <h2 id="message-detail-title">{counterpartName}</h2>
        <dl className="message-recipient-info">
          <div>
            <dt>보낸 사람</dt>
            <dd>{message.senderName}</dd>
          </div>
          <div>
            <dt>받는 사람</dt>
            <dd>{message.receiverName}</dd>
          </div>
        </dl>
        <p className="message-detail-content">{message.content}</p>
      </article>
    </div>
  );
}

export default MessageDetailModal;
