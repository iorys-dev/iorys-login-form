/* global React, ReactDOM, useTweaks, TweaksPanel, TweakToggle, TweakRadio, TweakSelect, IorysBackground, BACKGROUND_OPTIONS, BACKGROUND_STYLE_OPTIONS */
const { useState, useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "system": "HUB",
  "background": "still",
  "backgroundStyle": "mist",
  "tone": "light"
} /*EDITMODE-END*/;
const DARK_BACKGROUND_STYLES = ["graphite", "midnight"];

function switchVersion(version, edits) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "set_login_version", version, edits }, "*");
    return;
  }
  window.location.href = version === "v1" ? "Login.html" : "Login2.html";
}

function Brand({ tone, backgroundStyle }) {
  const useWhiteLogo = DARK_BACKGROUND_STYLES.includes(backgroundStyle);
  return (
    <div className="v2-brand" aria-label="iorys">
      <img
        className="v2-brand-logo"
        src={useWhiteLogo ? "assets/logo-iorys-white.svg" : "assets/logo-iorys.svg"}
        alt="iorys"
      />
    </div>
  );
}

function LoginCard({ systemName }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [bannerErr, setBannerErr] = useState("");
  const [loading, setLoading] = useState(false);

  function updateEmail(value) {
    setEmail(value);
    if (emailErr) setEmailErr("");
    if (bannerErr) setBannerErr("");
  }

  function updatePassword(value) {
    setPassword(value);
    if (passwordErr) setPasswordErr("");
    if (bannerErr) setBannerErr("");
  }

  function submit(event) {
    event.preventDefault();
    let invalid = false;
    if (!email) {
      setEmailErr("Email is required");
      invalid = true;
    }
    if (!password) {
      setPasswordErr("Password is required");
      invalid = true;
    }
    if (invalid) return;

    setBannerErr("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setBannerErr("Incorrect email or password. Please try again.");
    }, 1200);
  }

  return (
    <form className="v2-card" onSubmit={submit} noValidate>
      <h1 className="v2-title">Sign in to {systemName}</h1>
      <p className="v2-subtitle">Use your iorys account to continue.</p>

      {bannerErr && <div className="v2-error" role="alert">{bannerErr}</div>}

      <label className="v2-field-wrap" htmlFor="v2-email">
        <span className="v2-label">Email</span>
        <span className={"v2-field" + (emailFocus ? " is-focus" : "") + (emailErr ? " is-error" : "")}>
          <input
            id="v2-email"
            type="email"
            value={email}
            onChange={(event) => updateEmail(event.target.value)}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            autoComplete="username"
            spellCheck={false}
            placeholder="name@company.com"
            aria-invalid={!!emailErr}
          />
        </span>
        {emailErr && <div className="v2-field-err">{emailErr}</div>}
      </label>

      <label className="v2-field-wrap" htmlFor="v2-password">
        <div className="v2-field-head">
          <span className="v2-label">Password</span>
        </div>
        <span className={"v2-field" + (passwordFocus ? " is-focus" : "") + (passwordErr ? " is-error" : "")}>
          <input
            id="v2-password"
            type="password"
            value={password}
            onChange={(event) => updatePassword(event.target.value)}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            autoComplete="current-password"
            spellCheck={false}
            placeholder="••••••••"
            aria-invalid={!!passwordErr}
          />
        </span>
        {passwordErr && <div className="v2-field-err">{passwordErr}</div>}
      </label>

      <button className="v2-btn" type="submit" disabled={loading || !email || !password}>
        {loading && <span className="v2-spinner" />}
        {loading ? "Signing in" : "Sign in"}
      </button>

    </form>
  );
}

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  useEffect(() => {
    document.documentElement.dataset.tone = t.tone;
  }, [t.tone]);

  return (
    <div className="v2-page">
      <IorysBackground variant={t.background} tone={t.tone} styleName={t.backgroundStyle} />
      <Brand tone={t.tone} backgroundStyle={t.backgroundStyle} />

      <main className="v2-shell">
        <LoginCard systemName={t.system || "HUB"} />

        <footer className="v2-footer">© 2026 Iorys Ltd.</footer>
      </main>

      <TweaksPanel title="Tweaks" defaultOpen placement="bottom-right">
        <TweakRadio
          label="Version"
          value="v2"
          onChange={(version) => switchVersion(version, t)}
          options={[
            { value: "v1", label: "Login 1" },
            { value: "v2", label: "Login 2" },
          ]}
        />
        <TweakRadio
          label="System"
          value={t.system || "HUB"}
          onChange={(value) => setTweak("system", value)}
          options={[
            { value: "HUB", label: "HUB" },
            { value: "Ledger", label: "Ledger" },
            { value: "Connect", label: "Connect" },
          ]}
        />
        <TweakSelect
          label="Background effect"
          value={t.background}
          onChange={(value) => setTweak("background", value)}
          options={BACKGROUND_OPTIONS}
        />
        <TweakSelect
          label="Background style"
          value={t.backgroundStyle}
          onChange={(value) => setTweak("backgroundStyle", value)}
          options={BACKGROUND_STYLE_OPTIONS}
        />
        <TweakRadio
          label="Tone"
          value={t.tone}
          onChange={(value) => setTweak("tone", value)}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
