function LoginRequiredModal({ onConfirm, admin = false }) {
  return (
    <div className="login-required-backdrop" role="presentation">
      <section className="login-required-modal" role="dialog" aria-modal="true" aria-labelledby="login-required-title">
        <div className="login-required-icon" aria-hidden="true">⌁</div>
        <p className="eyebrow">SESSION REQUIRED</p>
        <h2 id="login-required-title">로그인 후 이용해주세요.</h2>
        <p>안전한 이용을 위해 다시 로그인해야 합니다.</p>
        <button type="button" onClick={onConfirm}>{admin ? "관리자 로그인하기" : "로그인하기"}</button>
      </section>
    </div>
  );
}

export default LoginRequiredModal;
