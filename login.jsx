/* global React, ReactDOM, IorysBackground */
const { useState, useEffect, useMemo, useRef } = React;

// ───────────────────────────────────────────────────────────────────
// Seeded PRNG so backgrounds don't jitter between renders.
// ───────────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ───────────────────────────────────────────────────────────────────
// Soft gradient blob layer — almost-static "aurora" backdrop.
// ───────────────────────────────────────────────────────────────────
function BgBlobs() {
  return (
    <div className="iorys-blobs" aria-hidden="true">
      <span className="iorys-blob iorys-blob--a" />
      <span className="iorys-blob iorys-blob--b" />
      <span className="iorys-blob iorys-blob--c" />
    </div>);

}

// ───────────────────────────────────────────────────────────────────
// Mesh — denser network, edges thicken near cursor (no displacement).
// Pulse markers sit at fixed joint coords; nothing visually drifts off
// its node.
// ───────────────────────────────────────────────────────────────────
function BgMesh({ tone }) {
  const stroke = tone === "dark" ? "#52EAC8" : "#002060";
  const W = 1600,H = 1000;
  const svgRef = useRef(null);
  const edgesRef = useRef(null);
  const nodesRef = useRef(null);

  const { points, edges, baseEdgeOps } = useMemo(() => {
    const rand = mulberry32(42);
    const cols = 20,rows = 13;
    const pts = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i + 0.5) * (W / cols) + (rand() - 0.5) * (W / cols) * 0.7;
        const y = (j + 0.5) * (H / rows) + (rand() - 0.5) * (H / rows) * 0.7;
        pts.push({ x, y, big: rand() < 0.07, pulse: rand() < 0.04 });
      }
    }
    const es = [];
    const ops = [];
    const maxLen = 170;
    for (let i = 0; i < pts.length; i++) {
      const dists = pts.map((p, j) => ({
        j, d: i === j ? Infinity : Math.hypot(p.x - pts[i].x, p.y - pts[i].y)
      })).sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3; k++) {
        if (dists[k].j > i && dists[k].d < maxLen) {
          es.push([i, dists[k].j, dists[k].d]);
          ops.push(Math.max(0.10, 0.42 - dists[k].d / 400));
        }
      }
    }
    return { points: pts, edges: es, baseEdgeOps: ops };
  }, []);

  // Mouse → mesh: edges near cursor get thicker + brighter.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const target = { x: -9999, y: -9999 };
    const cur = { x: -9999, y: -9999 };

    const onMove = (e) => {
      const r = svg.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width * W;
      target.y = (e.clientY - r.top) / r.height * H;
    };
    const onLeave = () => {target.x = -9999;target.y = -9999;};
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    let raf;
    const radius = 240;
    const baseW = 0.7;
    const maxExtraW = 1.3;
    const maxExtraOp = 0.45;

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.14;
      cur.y += (target.y - cur.y) * 0.14;

      const edgeEls = edgesRef.current?.children;
      if (edgeEls) {
        for (let i = 0; i < edges.length; i++) {
          const [a, b] = edges[i];
          const pa = points[a],pb = points[b];
          // Distance from cursor to the closer of the two endpoints —
          // gives a smoother proximity falloff than midpoint alone.
          const da = Math.hypot(pa.x - cur.x, pa.y - cur.y);
          const db = Math.hypot(pb.x - cur.x, pb.y - cur.y);
          const d = Math.min(da, db);
          const f = d < radius ? 1 - d / radius : 0;
          const eased = f * f; // ease-in so the effect is local
          const el = edgeEls[i];
          el.setAttribute("stroke-width", (baseW + eased * maxExtraW).toFixed(2));
          el.setAttribute("stroke-opacity", Math.min(1, baseEdgeOps[i] + eased * maxExtraOp).toFixed(3));
        }
      }

      const nodeEls = nodesRef.current?.children;
      if (nodeEls) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const d = Math.hypot(p.x - cur.x, p.y - cur.y);
          const f = d < radius ? 1 - d / radius : 0;
          const eased = f * f;
          const baseOp = points[i].big ? 0.9 : 0.55;
          nodeEls[i].setAttribute("opacity", Math.min(1, baseOp + eased * 0.45).toFixed(3));
        }
      }

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [points, edges, baseEdgeOps]);

  return (
    <svg ref={svgRef} className="iorys-bg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="mesh-glow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <g ref={edgesRef}>
        {edges.map(([a, b], i) =>
        <line
          key={i}
          x1={points[a].x} y1={points[a].y}
          x2={points[b].x} y2={points[b].y}
          stroke={stroke}
          strokeOpacity={baseEdgeOps[i]}
          strokeWidth="0.7"
          strokeLinecap="round" />

        )}
      </g>

      <g ref={nodesRef}>
        {points.map((p, i) => p.big ?
        <g key={i} opacity="0.9">
            <circle cx={p.x} cy={p.y} r="6" fill={stroke} opacity="0.22" filter="url(#mesh-glow)" />
            <circle cx={p.x} cy={p.y} r="2.6" fill={stroke} />
          </g> :

        <circle key={i} cx={p.x} cy={p.y} r="1.3" fill={stroke} opacity="0.55" />
        )}
      </g>

      {/* Pulses are independent elements at fixed joint coords; they
           always stay anchored to their joint regardless of mouse. */}
      <g>
        {points.filter((p) => p.pulse).map((p, i) =>
        <g key={"p" + i}>
            <circle cx={p.x} cy={p.y} r="2" fill={stroke} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="3" fill="none" stroke={stroke} strokeWidth="1">
              <animate attributeName="r" values="3;16;3" dur="3.8s" begin={`${i * 0.7 % 3.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="3.8s" begin={`${i * 0.7 % 3.5}s`} repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </g>
    </svg>);

}

// ───────────────────────────────────────────────────────────────────
// Eye icon
// ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ?
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg> :

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.2 4" />
      <path d="M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 5.4-1.4" />
      <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
    </svg>;

}

// ───────────────────────────────────────────────────────────────────
// Login card
// ───────────────────────────────────────────────────────────────────
const PW_PLACEHOLDER = "••••••••••";

function LoginCard({ systemName }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [bannerErr, setBannerErr] = useState("");
  const [loading, setLoading] = useState(false);

  function onEmailChange(v) {
    setEmail(v);
    if (emailErr) setEmailErr("");
    if (bannerErr) setBannerErr("");
  }
  function onPwChange(v) {
    setPw(v);
    if (pwErr) setPwErr("");
    if (bannerErr) setBannerErr("");
  }

  function submit(e) {
    e.preventDefault();
    let bad = false;
    if (!email) { setEmailErr("Email is required"); bad = true; }
    if (!pw) { setPwErr("Password is required"); bad = true; }
    if (bad) return;
    setBannerErr("");
    setLoading(true);
    // Simulated auth — always fails for the prototype.
    setTimeout(() => {
      setLoading(false);
      setBannerErr("Incorrect email or password. Please try again.");
    }, 1400);
  }

  return (
    <form className="iorys-card" onSubmit={submit} noValidate>
      <h1 className="iorys-card__title">Sign in to {systemName}</h1>

      {bannerErr && (
        <div className="iorys-err" role="alert">{bannerErr}</div>
      )}

      <label htmlFor="email" className="iorys-field-wrap">
        <span className="iorys-field-label">Email</span>
        <span className={"iorys-field" + (emailFocus ? " is-focus" : "") + (emailErr ? " is-error" : "")}>
          <input
            id="email" type="email" value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            autoComplete="username" spellCheck={false}
            placeholder="user@example.com"
            aria-invalid={!!emailErr}
          />
        </span>
        {emailErr && <div className="iorys-field-err">{emailErr}</div>}
      </label>

      <div className="iorys-pw-head">
        <span className="iorys-field-label">Password</span>
      </div>
      <label htmlFor="pw" className="iorys-field-wrap iorys-field-wrap--nolabel">
        <span className={"iorys-field" + (pwFocus ? " is-focus" : "") + (pwErr ? " is-error" : "")}>
          <input
            id="pw" type={showPw ? "text" : "password"} value={pw}
            onChange={(e) => onPwChange(e.target.value)}
            onFocus={() => setPwFocus(true)}
            onBlur={() => setPwFocus(false)}
            autoComplete="current-password" spellCheck={false}
            placeholder={PW_PLACEHOLDER}
            aria-invalid={!!pwErr}
          />
          <button
            type="button" className="iorys-eye"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((s) => !s)}
          ><EyeIcon open={showPw} /></button>
        </span>
        {pwErr && <div className="iorys-field-err">{pwErr}</div>}
      </label>

      <button type="submit" className={"iorys-btn" + (loading ? " is-loading" : "")} disabled={loading || !email || !pw}>
        {loading ?
          <><span className="iorys-spinner" /> Signing in…</> :
          "Sign in"}
      </button>

    </form>);

}

// ───────────────────────────────────────────────────────────────────
// App
// ───────────────────────────────────────────────────────────────────
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "system": "Ledger",
  "background": "mesh",
  "backgroundStyle": "mist",
  "tone": "light"
} /*EDITMODE-END*/;
const DARK_BACKGROUND_STYLES = ["graphite", "midnight"];

function App() {
  const [system, setSystem] = useState(() => systemFromHash());
  const t = { ...DEFAULTS, system };
  const useWhiteLogo = DARK_BACKGROUND_STYLES.includes(t.backgroundStyle);

  useEffect(() => {document.documentElement.dataset.tone = t.tone;}, [t.tone]);
  useEffect(() => {
    const onHashChange = () => setSystem(systemFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="iorys-page">
      <IorysBackground variant={t.background} tone={t.tone} styleName={t.backgroundStyle} />

      <main className="iorys-shell">
        <div className="iorys-brand">
          <img
            src={useWhiteLogo ? "assets/logo-iorys-white.svg" : "assets/logo-iorys.svg"}
            alt="iorys" width="76" height="44" />
          
        </div>

        <LoginCard systemName={t.system || "HUB"} />

        <footer className="iorys-foot">© 2026 Iorys Ltd.</footer>
      </main>
    </div>);

}

function systemFromHash(hash = window.location.hash) {
  const key = hash.replace("#", "").toLowerCase();
  if (key === "hub") return "HUB";
  if (key === "connect") return "Connect";
  return "Ledger";
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
