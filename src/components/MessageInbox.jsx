import { useEffect, useState } from "react";
import { getReceivedMessages, getSentMessages } from "./memberApi";
import MessageDetailModal from "./MessageDetailModal";

const inboxInfo = {
  sent: {
    eyebrow: "SENT NOTES",
    title: "보낸 쪽지",
    empty: "아직 보낸 쪽지가 없어요.",
    load: getSentMessages,
    label: "받는 사람",
  },
  received: {
    eyebrow: "RECEIVED NOTES",
    title: "받은 쪽지",
    empty: "아직 도착한 쪽지가 없어요.",
    load: getReceivedMessages,
    label: "보낸 사람",
  },
};

function MessageInbox({ type }) {
  const { eyebrow, title, empty, load, label } = inboxInfo[type];
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    load()
      .then((data) => {
        if (!isMounted) return;
        setMessages(data);
        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [load]);

  return (
    <section className="message-inbox">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {status === "loading" && <p className="inbox-feedback">쪽지를 불러오는 중이에요.</p>}
      {status === "error" && <p className="inbox-feedback inbox-feedback--error">쪽지를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>}
      {status === "ready" && messages.length === 0 && <div className="empty-inbox"><span>✉</span><p>{empty}</p></div>}
      {status === "ready" && messages.length > 0 && <div className="message-list">{messages.map((message) => <button className="message-card" type="button" key={message.id} onClick={() => setSelectedMessage(message)}><p className="message-card-label">{label}</p><h2>{type === "received" ? message.senderName : message.receiverName}</h2>{type === "sent" && <p className="message-sender-name">보낸 이름 · {message.senderName}</p>}<p className="message-card-content">{message.content}</p></button>)}</div>}
      {selectedMessage && <MessageDetailModal message={selectedMessage} counterpartName={type === "received" ? selectedMessage.senderName : selectedMessage.receiverName} label={label} onClose={() => setSelectedMessage(null)} />}
    </section>
  );
}

export default MessageInbox;
