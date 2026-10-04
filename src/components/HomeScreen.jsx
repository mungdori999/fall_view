import { useEffect, useState } from "react";
import LetterModal from "./LetterModal";
import MessageInbox from "./MessageInbox";
import { navigationItems } from "../data/people";
import { getMemberName } from "../utils/authStorage";
import { getLetterRecipients, getRemainingMessageCount } from "./memberApi";

function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterRecipients, setLetterRecipients] = useState([]);
  const [remainingMessageCount, setRemainingMessageCount] = useState(null);
  const [isLoadingLetterData, setIsLoadingLetterData] = useState(false);
  const [letterDataError, setLetterDataError] = useState("");
  const memberName = getMemberName();

  useEffect(() => {
    let isMounted = true;

    const loadLetterData = async () => {
      if (!isMounted) return;
      setIsLoadingLetterData(true);
      setLetterDataError("");

      try {
        const [recipients, count] = await Promise.all([
          getLetterRecipients(),
          getRemainingMessageCount(),
        ]);
        if (!isMounted) return;
        setLetterRecipients(recipients);
        setRemainingMessageCount(count.remainingCount);
      } catch (error) {
        if (isMounted) setLetterDataError(error.message);
      } finally {
        if (isMounted) setIsLoadingLetterData(false);
      }
    };

    loadLetterData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenLetter = () => {
    if (isLoadingLetterData || remainingMessageCount === null) return;
    setIsLetterModalOpen(true);
  };

  const handleLetterSent = () => {
    setIsLetterModalOpen(false);
    setRemainingMessageCount((count) => Math.max(0, count - 1));
    setActiveTab("sent");
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab !== "home") return;

    setIsLoadingLetterData(true);
    setLetterDataError("");
    try {
      const count = await getRemainingMessageCount();
      setRemainingMessageCount(count.remainingCount);
    } catch (error) {
      setLetterDataError(error.message);
    } finally {
      setIsLoadingLetterData(false);
    }
  };

  return (
    <main className="phone-shell">
      <header className="topbar">
        <div className="wordmark">
          <span>다시,</span> 가을
        </div>
        <p className="member-greeting"><strong>{memberName}</strong>님</p>
      </header>
      {activeTab === "home" ? <>
      <section className="greeting">
        <p className="eyebrow">2026 AUTUMN LOVE PROGRAM</p>
        <h1>
          우리의 계절이
          <br />
          천천히 <em>시작되고</em> 있어요.
        </h1>
        <p className="intro">
          한 장의 쪽지로 마음을 건네보세요.
          <br />
          가을 끝자락, 좋은 인연을 만나길 바라요.
        </p>
      </section>
      <section className="letter-status">
        <div className="stamp">✉</div>
        <div>
          <strong>오늘, 마음을 전해보세요</strong>
          <p>
            보낼 수 있는 쪽지 <b>{remainingMessageCount ?? "—"}</b>장
          </p>
        </div>
        <button onClick={handleOpenLetter} disabled={isLoadingLetterData || remainingMessageCount === null}>
          {isLoadingLetterData ? "불러오는 중" : "쪽지 쓰기"} <span>→</span>
        </button>
      </section>
      {letterDataError && <p className="letter-data-error" role="alert">{letterDataError}</p>}
      </> : <MessageInbox type={activeTab} />}

      <nav className="bottom-nav">
        {navigationItems.map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={activeTab === id ? "active" : ""}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      {isLetterModalOpen && (
        <LetterModal
          onClose={() => setIsLetterModalOpen(false)}
          onSent={handleLetterSent}
          recipients={letterRecipients}
          remainingMessageCount={remainingMessageCount}
        />
      )}
    </main>
  );
}

export default HomeScreen;
