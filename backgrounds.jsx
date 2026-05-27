/* global React */
const { useEffect: bgUseEffect, useMemo: bgUseMemo, useRef: bgUseRef, useState: bgUseState } = React;

const BACKGROUND_OPTIONS = [
  { value: "still", label: "Still" },
  { value: "mesh", label: "Mesh" },
  { value: "topology", label: "Topology" },
  { value: "circuit", label: "Circuit" },
  { value: "particles", label: "Particles" },
  { value: "contours", label: "Contours" },
  { value: "ribbons", label: "Ribbons" },
  { value: "ribbons2", label: "Ribbons v2" },
  { value: "blueprint", label: "Blueprint" },
];

const BACKGROUND_STYLE_OPTIONS = [
  { value: "mist", label: "Mist" },
  { value: "ice", label: "Ice" },
  { value: "graphite", label: "Graphite" },
  { value: "midnight", label: "Midnight" },
  { value: "teal", label: "Teal" },
  { value: "steel", label: "Steel" },
  { value: "violet", label: "Violet" },
  { value: "copper", label: "Copper" },
  { value: "emerald", label: "Emerald" },
  { value: "mono", label: "Mono" },
];

const __BGFX_STYLE = `
  .bgfx{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;background:var(--bgfx-base)}
  .bgfx--stage{border-radius:inherit}
  .bgfx__plane{position:absolute;inset:0}
  .bgfx__svg{position:absolute;inset:0;width:100%;height:100%}
  .bgfx--dark{--bgfx-base:#060B1F;--bgfx-ink:#52EAC8;--bgfx-ink2:#7DEDD8;--bgfx-navy:#060B1F;--bgfx-panel:#13245E;--bgfx-soft:rgba(82,234,200,.16);--bgfx-soft2:rgba(36,92,137,.20);--bgfx-soft3:rgba(20,37,77,.22)}
  .bgfx--light{--bgfx-base:#F8FAFC;--bgfx-ink:#245C89;--bgfx-ink2:#16BF99;--bgfx-navy:#F8FAFC;--bgfx-panel:#DFE7F0;--bgfx-soft:rgba(95,178,238,.28);--bgfx-soft2:rgba(31,45,72,.12);--bgfx-soft3:rgba(20,37,77,.12)}
  .bgfx-style-mist{--bgfx-base:linear-gradient(135deg,#f8fbff 0%,#e9f5ff 38%,#f4f7fb 72%,#edf2f7 100%);--bgfx-soft:rgba(95,178,238,.30);--bgfx-soft2:rgba(31,45,72,.12);--bgfx-soft3:rgba(64,96,130,.10)}
  .bgfx-style-ice{--bgfx-base:radial-gradient(ellipse at 18% 82%,rgba(131,205,255,.42),transparent 38%),linear-gradient(135deg,#f9fcff 0%,#dcedf8 48%,#eef5f9 100%);--bgfx-soft:rgba(76,169,232,.32);--bgfx-soft2:rgba(12,129,160,.12);--bgfx-soft3:rgba(38,77,116,.10)}
  .bgfx-style-graphite{--bgfx-base:radial-gradient(ellipse at 78% 8%,rgba(117,135,164,.22),transparent 34%),linear-gradient(135deg,#111827 0%,#202735 48%,#d8dde5 100%);--bgfx-soft:rgba(79,99,132,.26);--bgfx-soft2:rgba(15,23,42,.20);--bgfx-soft3:rgba(255,255,255,.10)}
  .bgfx-style-midnight{--bgfx-base:radial-gradient(ellipse at 22% 78%,rgba(31,92,139,.36),transparent 40%),linear-gradient(135deg,#050816 0%,#091631 58%,#12233c 100%);--bgfx-soft:rgba(37,211,186,.16);--bgfx-soft2:rgba(51,103,174,.22);--bgfx-soft3:rgba(5,8,22,.24)}
  .bgfx-style-teal{--bgfx-base:radial-gradient(ellipse at 24% 74%,rgba(32,202,174,.26),transparent 36%),linear-gradient(135deg,#f6fffc 0%,#dff4ee 46%,#edf5f6 100%);--bgfx-soft:rgba(22,191,153,.26);--bgfx-soft2:rgba(36,92,137,.13);--bgfx-soft3:rgba(58,161,156,.12)}
  .bgfx-style-steel{--bgfx-base:linear-gradient(140deg,#f7f8fa 0%,#d8e0e9 42%,#f2f5f8 72%,#cbd5df 100%);--bgfx-soft:rgba(76,118,160,.22);--bgfx-soft2:rgba(46,61,81,.14);--bgfx-soft3:rgba(255,255,255,.16)}
  .bgfx-style-violet{--bgfx-base:radial-gradient(ellipse at 76% 20%,rgba(124,92,255,.18),transparent 34%),linear-gradient(135deg,#fbfaff 0%,#ebe9ff 45%,#f2f8ff 100%);--bgfx-soft:rgba(92,126,255,.18);--bgfx-soft2:rgba(22,191,153,.12);--bgfx-soft3:rgba(83,64,140,.10)}
  .bgfx-style-copper{--bgfx-base:radial-gradient(ellipse at 18% 72%,rgba(214,148,98,.18),transparent 38%),linear-gradient(135deg,#fbfaf7 0%,#ebe3d8 44%,#f5f7fa 100%);--bgfx-soft:rgba(178,113,62,.18);--bgfx-soft2:rgba(36,92,137,.12);--bgfx-soft3:rgba(102,76,52,.10)}
  .bgfx-style-emerald{--bgfx-base:radial-gradient(ellipse at 82% 82%,rgba(37,178,135,.22),transparent 34%),linear-gradient(135deg,#f7fff9 0%,#e0f2e9 50%,#f4f8f8 100%);--bgfx-soft:rgba(22,163,111,.24);--bgfx-soft2:rgba(31,45,72,.11);--bgfx-soft3:rgba(21,128,97,.10)}
  .bgfx-style-mono{--bgfx-base:linear-gradient(135deg,#ffffff 0%,#eceff3 44%,#f7f8fa 100%);--bgfx-soft:rgba(100,116,139,.18);--bgfx-soft2:rgba(15,23,42,.10);--bgfx-soft3:rgba(148,163,184,.12)}

  .bgfx__blobs span{position:absolute;border-radius:50%;filter:blur(110px);opacity:.78;transform:translate3d(0,0,0)}
  .bgfx__blobs span:nth-child(1){top:-22%;left:-18%;width:70%;height:70%;background:var(--bgfx-soft);animation:bgfx-drift-a 38s ease-in-out infinite alternate}
  .bgfx__blobs span:nth-child(2){right:-20%;bottom:-25%;width:80%;height:80%;background:var(--bgfx-soft2);animation:bgfx-drift-b 44s ease-in-out infinite alternate}
  .bgfx__blobs span:nth-child(3){top:30%;left:38%;width:55%;height:55%;background:var(--bgfx-soft3);animation:bgfx-drift-c 52s ease-in-out infinite alternate}
  .bgfx--still .bgfx__blobs span{animation:none}
  .bgfx--still .bgfx__blobs span:nth-child(3){display:none}

  .bgfx--topology .bgfx__plane{background:
    radial-gradient(ellipse at 24% 28%, color-mix(in srgb,var(--bgfx-ink) 16%,transparent), transparent 34%),
    radial-gradient(ellipse at 74% 66%, color-mix(in srgb,var(--bgfx-ink2) 12%,transparent), transparent 30%),
    linear-gradient(90deg,color-mix(in srgb,var(--bgfx-ink) 9%,transparent) 1px,transparent 1px),
    linear-gradient(0deg,color-mix(in srgb,var(--bgfx-ink) 7%,transparent) 1px,transparent 1px);
    background-size:auto,auto,104px 104px,104px 104px;animation:bgfx-breathe 48s ease-in-out infinite alternate}
  .bgfx--blueprint .bgfx__plane{background:
    linear-gradient(color-mix(in srgb,var(--bgfx-ink) 13%,transparent) 1px,transparent 1px),
    linear-gradient(90deg,color-mix(in srgb,var(--bgfx-ink) 13%,transparent) 1px,transparent 1px),
    linear-gradient(color-mix(in srgb,var(--bgfx-ink2) 6%,transparent) 1px,transparent 1px),
    linear-gradient(90deg,color-mix(in srgb,var(--bgfx-ink2) 6%,transparent) 1px,transparent 1px);
    background-size:96px 96px,96px 96px,24px 24px,24px 24px;animation:bgfx-blueprint-drift 70s linear infinite}
  .bgfx__wire{will-change:transform,opacity;animation:bgfx-wire-drift 44s ease-in-out infinite alternate}
  .bgfx__wire-slow{will-change:transform;animation:bgfx-wire-drift-soft 64s ease-in-out infinite alternate}
  .bgfx__dash{stroke-dasharray:10 16;animation:bgfx-dash 38s linear infinite}
  .bgfx__particle{position:absolute;border-radius:50%;background:var(--bgfx-ink);opacity:var(--o,.45);width:var(--s,2px);height:var(--s,2px);box-shadow:0 0 calc(var(--s,2px) * 4) color-mix(in srgb,var(--bgfx-ink) 42%,transparent);animation:bgfx-particle-drift var(--d,42s) ease-in-out var(--delay,0s) infinite alternate;will-change:transform,opacity}
  .bgfx__particle--burst{background:var(--bgfx-ink2);box-shadow:0 0 calc(var(--s,2px) * 7) color-mix(in srgb,var(--bgfx-ink2) 58%,transparent);animation:bgfx-particle-burst var(--life,4.8s) cubic-bezier(.16,.62,.24,1) forwards}
  .bgfx__particle--spawn{animation:bgfx-particle-spawn var(--life,4.8s) ease-in-out forwards}

  @keyframes bgfx-drift-a{to{transform:translate3d(60px,40px,0) scale(1.08)}}
  @keyframes bgfx-drift-b{to{transform:translate3d(-50px,-40px,0) scale(1.05)}}
  @keyframes bgfx-drift-c{to{transform:translate3d(30px,-60px,0) scale(1.1)}}
  @keyframes bgfx-breathe{to{transform:translate3d(2%,-1%,0) scale(1.035);filter:saturate(1.06)}}
  @keyframes bgfx-blueprint-drift{to{background-position:192px 96px,192px 96px,48px 24px,48px 24px}}
  @keyframes bgfx-wire-drift{to{transform:translate3d(18px,-14px,0) scale(1.015);opacity:.94}}
  @keyframes bgfx-wire-drift-soft{to{transform:translate3d(-14px,10px,0) scale(1.01)}}
  @keyframes bgfx-dash{to{stroke-dashoffset:-180}}
  @keyframes bgfx-particle-drift{to{transform:translate3d(var(--tx,18px),var(--ty,-22px),0);opacity:calc(var(--o,.45) + .16)}}
  @keyframes bgfx-particle-burst{0%{transform:translate3d(-50%,-50%,0) scale(.7);opacity:0}14%{opacity:var(--o,.72)}72%{opacity:calc(var(--o,.72) * .72)}100%{transform:translate3d(calc(-50% + var(--tx,18px)),calc(-50% + var(--ty,-18px)),0) scale(.32);opacity:0}}
  @keyframes bgfx-particle-spawn{0%{transform:translate3d(0,0,0) scale(.2);opacity:0}18%{opacity:var(--o,.38)}76%{opacity:calc(var(--o,.38) * .82)}100%{transform:translate3d(var(--tx,20px),var(--ty,-24px),0) scale(.35);opacity:0}}
  @media (prefers-reduced-motion:reduce){.bgfx *{animation:none!important}}
`;

function bgMulberry32(a) {
  return function () {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function BgfxBlobs() {
  return <div className="bgfx__blobs"><span /><span /><span /></div>;
}

function BgfxMesh({ tone }) {
  const stroke = tone === "dark" ? "#52EAC8" : "#245C89";
  const W = 1600, H = 1000;
  const svgRef = bgUseRef(null);
  const edgesRef = bgUseRef(null);
  const nodesRef = bgUseRef(null);

  const { points, edges, baseEdgeOps } = bgUseMemo(() => {
    const rand = bgMulberry32(42);
    const cols = 20, rows = 13;
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

  bgUseEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const target = { x: -9999, y: -9999 };
    const cur = { x: -9999, y: -9999 };

    const onMove = (e) => {
      const r = svg.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width * W;
      target.y = (e.clientY - r.top) / r.height * H;
    };
    const onLeave = () => { target.x = -9999; target.y = -9999; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    let raf;
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.14;
      cur.y += (target.y - cur.y) * 0.14;
      const edgeEls = edgesRef.current?.children;
      if (edgeEls) {
        for (let i = 0; i < edges.length; i++) {
          const [a, b] = edges[i];
          const pa = points[a], pb = points[b];
          const d = Math.min(Math.hypot(pa.x - cur.x, pa.y - cur.y), Math.hypot(pb.x - cur.x, pb.y - cur.y));
          const f = d < 240 ? 1 - d / 240 : 0;
          const eased = f * f;
          edgeEls[i].setAttribute("stroke-width", (0.7 + eased * 1.3).toFixed(2));
          edgeEls[i].setAttribute("stroke-opacity", Math.min(1, baseEdgeOps[i] + eased * 0.45).toFixed(3));
        }
      }
      const nodeEls = nodesRef.current?.children;
      if (nodeEls) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const d = Math.hypot(p.x - cur.x, p.y - cur.y);
          const f = d < 240 ? 1 - d / 240 : 0;
          nodeEls[i].setAttribute("opacity", Math.min(1, (p.big ? 0.9 : 0.55) + f * f * 0.45).toFixed(3));
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
    <svg ref={svgRef} className="bgfx__svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox={`0 0 ${W} ${H}`}>
      <defs><filter id="bgfx-mesh-glow"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g ref={edgesRef}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y}
                stroke={stroke} strokeOpacity={baseEdgeOps[i]} strokeWidth="0.7" strokeLinecap="round" />
        ))}
      </g>
      <g ref={nodesRef}>
        {points.map((p, i) => p.big ? (
          <g key={i} opacity="0.9">
            <circle cx={p.x} cy={p.y} r="6" fill={stroke} opacity="0.22" filter="url(#bgfx-mesh-glow)" />
            <circle cx={p.x} cy={p.y} r="2.6" fill={stroke} />
          </g>
        ) : <circle key={i} cx={p.x} cy={p.y} r="1.3" fill={stroke} opacity="0.55" />)}
      </g>
      <g>
        {points.filter((p) => p.pulse).map((p, i) => (
          <g key={"p" + i}>
            <circle cx={p.x} cy={p.y} r="2" fill={stroke} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="3" fill="none" stroke={stroke} strokeWidth="1">
              <animate attributeName="r" values="3;16;3" dur="3.8s" begin={`${i * 0.7 % 3.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="3.8s" begin={`${i * 0.7 % 3.5}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  );
}

function BgfxParticles() {
  const [bursts, setBursts] = bgUseState([]);
  const [spawned, setSpawned] = bgUseState([]);
  const lastEmitRef = bgUseRef(0);
  const burstIdRef = bgUseRef(0);
  const spawnIdRef = bgUseRef(0);
  const randRef = bgUseRef(bgMulberry32(509));
  const spawnRandRef = bgUseRef(bgMulberry32(810));
  const particles = bgUseMemo(() => {
    const rand = bgMulberry32(108);
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 0.8 + rand() * 3.8,
      opacity: 0.12 + rand() * 0.52,
      duration: 14 + rand() * 28,
      delay: -rand() * 28,
      tx: (rand() - 0.5) * 118,
      ty: (rand() - 0.5) * 96,
    }));
  }, []);

  bgUseEffect(() => {
    const emit = () => {
      const now = performance.now();
      const rand = spawnRandRef.current;
      setSpawned((prev) => {
        const alive = prev.filter((p) => now - p.created < p.life * 1000);
        const room = Math.max(0, 180 - alive.length);
        const count = Math.min(room, 7 + Math.floor(rand() * 8));
        if (count === 0) return alive;

        const next = Array.from({ length: count }).map(() => ({
          id: spawnIdRef.current++,
          created: now,
          left: rand() * 100,
          top: rand() * 100,
          size: 0.7 + rand() * 2.6,
          opacity: 0.16 + rand() * 0.34,
          life: 3.2 + rand() * 3.6,
          tx: (rand() - 0.5) * 70,
          ty: (rand() - 0.5) * 62,
        }));
        return [...alive, ...next];
      });
    };

    emit();
    const interval = window.setInterval(emit, 420);
    return () => window.clearInterval(interval);
  }, []);

  bgUseEffect(() => {
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastEmitRef.current < 125) return;
      lastEmitRef.current = now;

      const xPct = e.clientX / Math.max(1, window.innerWidth) * 100;
      const yPct = e.clientY / Math.max(1, window.innerHeight) * 100;
      const quadrant = (xPct < 50 ? "l" : "r") + (yPct < 50 ? "t" : "b");
      const rand = randRef.current;

      setBursts((prev) => {
        const alive = prev.filter((p) => now - p.created < p.life * 1000);
        const inQuadrant = alive.filter((p) => p.quadrant === quadrant).length;
        const count = Math.max(0, Math.min(2, 28 - inQuadrant));
        if (count === 0) return alive;

        const next = Array.from({ length: count }).map(() => {
          const angle = rand() * Math.PI * 2;
          const distance = 92 + rand() * 155;
          return {
            id: burstIdRef.current++,
            created: now,
            quadrant,
            left: xPct + (rand() - 0.5) * 7,
            top: yPct + (rand() - 0.5) * 7,
            size: 2.2 + rand() * 3.8,
            opacity: 0.58 + rand() * 0.34,
            life: 4.2 + rand() * 2.8,
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
          };
        });
        return [...alive, ...next];
      });
    };

    const cleanup = window.setInterval(() => {
      const now = performance.now();
      setBursts((prev) => prev.filter((p) => now - p.created < p.life * 1000));
    }, 900);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearInterval(cleanup);
    };
  }, []);

  return (
    <div>
      {particles.map((p) => (
        <span
          key={p.id}
          className="bgfx__particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            "--s": `${p.size.toFixed(1)}px`,
            "--o": p.opacity.toFixed(2),
            "--d": `${p.duration.toFixed(1)}s`,
            "--delay": `${p.delay.toFixed(1)}s`,
            "--tx": `${p.tx.toFixed(1)}px`,
            "--ty": `${p.ty.toFixed(1)}px`,
          }}
        />
      ))}
      {spawned.map((p) => (
        <span
          key={p.id}
          className="bgfx__particle bgfx__particle--spawn"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            "--s": `${p.size.toFixed(1)}px`,
            "--o": p.opacity.toFixed(2),
            "--life": `${p.life.toFixed(1)}s`,
            "--tx": `${p.tx.toFixed(1)}px`,
            "--ty": `${p.ty.toFixed(1)}px`,
          }}
        />
      ))}
      {bursts.map((p) => (
        <span
          key={p.id}
          className="bgfx__particle bgfx__particle--burst"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            "--s": `${p.size.toFixed(1)}px`,
            "--o": p.opacity.toFixed(2),
            "--life": `${p.life.toFixed(1)}s`,
            "--tx": `${p.tx.toFixed(1)}px`,
            "--ty": `${p.ty.toFixed(1)}px`,
          }}
        />
      ))}
    </div>
  );
}

function BgfxTopology({ color, color2, faint }) {
  const svgRef = bgUseRef(null);
  const pathsRef = bgUseRef(null);
  const topologyPaths = bgUseMemo(() => (
    Array.from({ length: 10 }).map((_, i) =>
      `M-180 ${80 + i * 58} C${70 + i * 14} ${-40 + i * 62}, ${310 + i * 22} ${240 + i * 24}, ${530 + i * 30} ${120 + i * 50} S${850 + i * 24} ${390 + i * 12}, 1380 ${230 + i * 48}`
    )
  ), []);

  bgUseEffect(() => {
    const svg = svgRef.current;
    const group = pathsRef.current;
    if (!svg || !group) return;

    let raf = 0;
    const reset = () => {
      Array.from(group.children).forEach((path) => {
        path.setAttribute("stroke-opacity", faint.toFixed(3));
        path.setAttribute("stroke-width", "1");
      });
    };
    const update = (event) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const matrix = svg.getScreenCTM();
        if (!matrix) return;
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const cursor = point.matrixTransform(matrix.inverse());

        Array.from(group.children).forEach((path) => {
          const total = path.getTotalLength();
          let minDistance = Infinity;
          for (let i = 0; i <= 18; i++) {
            const p = path.getPointAtLength(total * i / 18);
            minDistance = Math.min(minDistance, Math.hypot(p.x - cursor.x, p.y - cursor.y));
          }
          const force = Math.max(0, 1 - minDistance / 170);
          const eased = force * force;
          path.setAttribute("stroke-opacity", Math.min(0.46, faint + eased * 0.18).toFixed(3));
          path.setAttribute("stroke-width", (1 + eased * 0.35).toFixed(2));
        });
      });
    };

    window.addEventListener("pointermove", update);
    window.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, [faint]);

  return (
    <svg ref={svgRef} className="bgfx__svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
      <g ref={pathsRef} className="bgfx__wire" fill="none" stroke={color} strokeOpacity={faint} strokeWidth="1">
        {topologyPaths.map((path, i) => <path key={i} d={path} />)}
      </g>
        <g fill={color2} opacity="0.5">
          {[140, 320, 510, 720, 930, 1080].map((x, i) => <circle key={x} cx={x} cy={180 + (i % 3) * 120} r="2.2" />)}
        </g>
        <g fill="none" stroke={color2} strokeOpacity="0.24" strokeWidth="1.2" strokeLinecap="round">
          <path className="bgfx__dash" d="M-220 420 C120 280, 300 520, 560 360 S960 160, 1420 280" />
        </g>
        <g fill={color2}>
          {[
            [260, 292, "0s"],
            [540, 360, "1.4s"],
            [790, 250, "2.8s"],
            [1030, 282, "4.2s"],
          ].map(([cx, cy, begin]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" opacity="0.62">
              <animate attributeName="r" values="2.2;8;2.2" dur="6.4s" begin={begin} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.62;0.08;0.62" dur="6.4s" begin={begin} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      </svg>
    );
}

function BgfxSvgPattern({ variant, tone }) {
  const color = tone === "dark" ? "#52EAC8" : "#245C89";
  const color2 = tone === "dark" ? "#245C89" : "#16BF99";
  const faint = tone === "dark" ? 0.24 : 0.18;

  if (variant === "topology") {
    return <BgfxTopology color={color} color2={color2} faint={faint} />;
  }

  if (variant === "circuit") {
    const circuitPaths = [
      "M-80 160 H130 Q158 160 158 188 V296 Q158 324 186 324 H390 Q418 324 418 296 V232 Q418 204 446 204 H1280",
      "M-80 235 H42 Q70 235 70 207 V122 Q70 94 98 94 H290 Q318 94 318 122 V178 Q318 206 346 206 H1280",
      "M-80 350 H230 Q258 350 258 322 V246 Q258 218 286 218 H540 Q568 218 568 246 V432 Q568 460 596 460 H1280",
      "M-80 430 H102 Q130 430 130 458 V520 Q130 548 158 548 H330 Q358 548 358 520 V472 Q358 444 386 444 H1280",
      "M-80 560 H180 Q208 560 208 532 V458 Q208 430 236 430 H470 Q498 430 498 402 V332 Q498 304 526 304 H1280",
      "M-80 650 H260 Q288 650 288 622 V594 Q288 566 316 566 H720 Q748 566 748 538 V500 Q748 472 776 472 H1280",
      "M92 -80 V92 Q92 120 120 120 H332 Q360 120 360 148 V840",
      "M218 -80 V256 Q218 284 246 284 H438 Q466 284 466 312 V840",
      "M534 -80 V124 Q534 152 562 152 H692 Q720 152 720 180 V840",
      "M760 -80 V166 Q760 194 732 194 H652 Q624 194 624 222 V840",
      "M908 -80 V228 Q908 256 936 256 H1066 Q1094 256 1094 284 V840",
      "M1010 -80 V292 Q1010 320 982 320 H870 Q842 320 842 348 V840",
    ];
    const signalDots = [
      [0, "18s", "-2s", 2.4],
      [1, "23s", "-9s", 1.8],
      [2, "20s", "-13s", 2.8],
      [3, "27s", "-4s", 2.1],
      [4, "24s", "-16s", 2.5],
      [5, "31s", "-22s", 1.9],
      [6, "26s", "-8s", 2.2],
      [7, "34s", "-19s", 1.7],
      [8, "29s", "-11s", 2.6],
      [9, "37s", "-28s", 2.0],
      [10, "32s", "-6s", 2.3],
      [11, "41s", "-24s", 1.8],
    ];
    const signalColor = tone === "dark" ? "#245C89" : "#163B66";
    return (
      <svg className="bgfx__svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        <g className="bgfx__wire-slow" fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          {circuitPaths.map((path, i) => <path key={i} d={path} />)}
        </g>
        <g className="bgfx__dash" fill="none" stroke={color2} strokeOpacity="0.20" strokeWidth="1.4" strokeLinecap="round">
          <path d="M-40 350 H230 Q258 350 258 322 V246 Q258 218 286 218 H540" />
          <path d="M596 460 H940 Q968 460 968 432 V320" />
          <path d="M-60 235 H42 Q70 235 70 207 V122 Q70 94 98 94 H290" />
          <path d="M386 444 H610 Q638 444 638 416 V304" />
        </g>
        <g fill={signalColor} opacity="0.88">
          {signalDots.map(([pathIndex, dur, begin, radius], i) => (
            <circle key={`signal-${i}`} r={radius}>
              <animateMotion
                path={circuitPaths[pathIndex]}
                dur={dur}
                begin={begin}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </circle>
          ))}
        </g>
        <g fill={color2} opacity="0.52">
          {[
            [158, 324], [418, 204], [568, 460], [208, 560], [498, 304],
            [760, 194], [842, 348], [1010, 320], [360, 120], [624, 222],
            [70, 235], [318, 206], [130, 548], [358, 444], [748, 472],
            [218, 284], [466, 312], [534, 152], [908, 256], [1094, 284],
          ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" />)}
        </g>
      </svg>
    );
  }

  if (variant === "contours") {
    return (
      <svg className="bgfx__svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        <g className="bgfx__dash" fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="1.1">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M-220 ${90 + i * 48} C${90 + i * 16} ${-20 + i * 44}, ${360 + i * 18} ${250 + i * 24}, ${610 + i * 22} ${130 + i * 48} S${930 + i * 18} ${120 + i * 56}, 1420 ${210 + i * 38}`} />
          ))}
        </g>
      </svg>
    );
  }

  if (variant === "ribbons" || variant === "ribbons2") {
    const low = variant === "ribbons2";
    const count = low ? 18 : 6;
    return (
      <svg className="bgfx__svg" viewBox="0 0 1200 760" preserveAspectRatio="none">
        <g fill="none" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="translate"
            values={low ? "-76 18;54 -34;-46 -54;76 10;-76 18" : "-62 22;58 -30;-38 -46;70 8;-62 22"}
            dur={low ? "26s" : "22s"}
            repeatCount="indefinite"
          />
          {Array.from({ length: count }).map((_, i) => (
            <path key={i} d={`M-220 ${low ? -110 + i * 58 : 190 + i * 68} C160 ${low ? -150 + i * 38 : 90 + i * 18}, 360 ${low ? 30 + i * 42 : 330 + i * 18}, 630 ${low ? -40 + i * 58 : 230 + i * 46} S980 ${low ? -130 + i * 62 : 110 + i * 40}, 1420 ${low ? -30 + i * 54 : 240 + i * 36}`}
              stroke={i % 2 ? color2 : color}
              strokeWidth={low ? (i % 3 === 0 ? "1.2" : "0.9") : (i % 2 ? "1.2" : "1.6")}
              strokeOpacity={low ? 0.10 + (i % 7) * 0.028 : 0.10 + i * 0.018}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 ${i % 2 ? -10 : 8};0 ${i % 2 ? 18 : -16};0 ${i % 2 ? -10 : 8}`}
                dur={`${18 + i * 1.7}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>
      </svg>
    );
  }

  return null;
}

function IorysBackground({ variant = "mesh", tone = "dark", styleName = "mist", framed = false }) {
  const classes = `bgfx bgfx--${variant} bgfx--${tone} bgfx-style-${styleName}${framed ? " bgfx--stage" : ""}`;
  const needsBlobs = variant === "mesh" || variant === "still";
  return (
    <div className={classes} aria-hidden="true">
      <style>{__BGFX_STYLE}</style>
      {needsBlobs && <BgfxBlobs />}
      {variant === "mesh" && <BgfxMesh tone={tone} />}
      {variant === "particles" && <BgfxParticles />}
      {["topology", "blueprint"].includes(variant) && <div className="bgfx__plane" />}
      <BgfxSvgPattern variant={variant} tone={tone} />
    </div>
  );
}

Object.assign(window, { BACKGROUND_OPTIONS, BACKGROUND_STYLE_OPTIONS, IorysBackground });
