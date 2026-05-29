import { useState, useEffect, useRef } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server.js";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const supabase = getSupabase();
  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("shop_id", shop)
      .single();
    return {
      settings: settings || {
        autoplay: false,
        layout: "carousel",
        accent_color: "#008060",
        float_mode: "rectangle",
        float_position: "bottom-right",
        float_size_desktop: 140,
        float_size_mobile: 80,
      },
    };
  } catch (e) {
    return {
      settings: {
        autoplay: false,
        layout: "carousel",
        accent_color: "#008060",
        float_mode: "rectangle",
        float_position: "bottom-right",
        float_size_desktop: 140,
        float_size_mobile: 80,
      },
    };
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const supabase = getSupabase();
  const formData = await request.formData();
  const settings = {
    shop_id: shop,
    autoplay: formData.get("autoplay") === "on",
    layout: formData.get("layout"),
    accent_color: formData.get("accent_color"),
    float_mode: formData.get("float_mode"),
    float_position: formData.get("float_position"),
    float_size_desktop: parseInt(formData.get("float_size_desktop")) || 140,
    float_size_mobile: parseInt(formData.get("float_size_mobile")) || 80,
  };
  await supabase.from("settings").upsert(settings, { onConflict: "shop_id" });
  return { ok: true };
};

/* ── Tiny design tokens ── */
const C = {
  bg: "#0f0f12",
  surface: "#18181e",
  border: "#2a2a35",
  accent: "#7c6dfa",
  accentHover: "#9182ff",
  text: "#e8e6ff",
  muted: "#7a7890",
  success: "#34d399",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: `1px solid ${C.border}`,
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.surface,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: C.text,
  },
  tag: {
    fontSize: 11,
    fontWeight: 600,
    background: C.accent + "22",
    color: C.accent,
    border: `1px solid ${C.accent}44`,
    borderRadius: 20,
    padding: "2px 10px",
    marginLeft: 10,
  },
  body: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 0,
    overflow: "hidden",
  },
  panel: {
    borderRight: `1px solid ${C.border}`,
    overflowY: "auto",
    padding: 28,
    background: C.surface,
  },
  preview: {
    background: "#0c0c10",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionDivider: {
    width: 24,
    height: 2,
    background: C.accent,
    borderRadius: 2,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: C.text,
    marginBottom: 6,
  },
  sublabel: {
    display: "block",
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
    marginBottom: 10,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.text,
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    marginBottom: 14,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a7890' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 36,
  },
  sliderWrap: { marginBottom: 18 },
  slider: {
    width: "100%",
    accentColor: C.accent,
    cursor: "pointer",
  },
  sliderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sliderVal: {
    fontSize: 12,
    fontWeight: 700,
    color: C.accent,
    minWidth: 36,
    textAlign: "right",
  },
  modeCard: {
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 10,
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  modeCardActive: {
    borderColor: C.accent,
    background: C.accent + "12",
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: C.border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  modeText: { flex: 1 },
  modeName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
  modeDesc: { fontSize: 11, color: C.muted },
  saveBtn: {
    width: "100%",
    padding: "12px",
    background: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "background 0.2s, transform 0.1s",
    marginTop: 8,
  },
  previewTabs: {
    display: "flex",
    borderBottom: `1px solid ${C.border}`,
    background: C.surface,
  },
  previewTab: {
    padding: "10px 20px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    color: C.muted,
    border: "none",
    background: "transparent",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  },
  previewTabActive: {
    color: C.accent,
    borderBottomColor: C.accent,
  },
  previewCanvas: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
};

/* ── Floating bubble preview ── */
function FloatPreview({ mode, position, sizeDesktop, sizeMobile, isMobile }) {
  const sz = isMobile ? sizeMobile : sizeDesktop;
  const h  = mode === "circle" ? sz : Math.round(sz * 1.78);

  const posStyle = (() => {
    switch (position) {
      case "bottom-left":  return { bottom: 24, left: 20 };
      case "mid-right":    return { top: "50%", right: 20, transform: "translateY(-50%)" };
      case "mid-left":     return { top: "50%", left: 20, transform: "translateY(-50%)" };
      default:             return { bottom: 24, right: 20 };
    }
  })();

  const bubbleStyle = {
    position: "absolute",
    width: sz,
    height: h,
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    borderRadius: mode === "circle" ? "50%" : 12,
    boxShadow: mode === "circle"
      ? "0 0 0 3px #fff, 0 0 0 5px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.5)"
      : "0 8px 32px rgba(0,0,0,0.5)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ...posStyle,
  };

  const ringStyle = mode === "circle" ? {
    position: "absolute",
    inset: -6,
    borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.5)",
    animation: "nqPulse 2.4s ease-out infinite",
  } : {};

  return (
    <div style={bubbleStyle}>
      {/* Fake video content */}
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(160deg, #667eea 0%, #764ba2 50%, #f64f59 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: mode === "circle" ? sz * 0.25 : 18, opacity: 0.9 }}>▶</span>
      </div>
      {/* Close btn — rectangle only */}
      {mode !== "circle" && (
        <div style={{
          position: "absolute", top: 5, right: 5,
          width: 18, height: 18, borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#fff",
        }}>✕</div>
      )}
      {/* Pulse ring — circle only */}
      {mode === "circle" && (
        <>
          <style>{`@keyframes nqPulse{0%{transform:scale(1);opacity:.8}60%{transform:scale(1.12);opacity:0}100%{transform:scale(1.12);opacity:0}}`}</style>
          <div style={ringStyle} />
          <div style={{
            position: "absolute", bottom: -24, left: "50%",
            transform: "translateX(-50%)", whiteSpace: "nowrap",
            fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.75)",
            background: "rgba(0,0,0,0.55)", borderRadius: 20, padding: "2px 8px",
            backdropFilter: "blur(4px)",
          }}>▼ Watch video</div>
        </>
      )}
    </div>
  );
}

/* ── Fake PDP page for preview canvas ── */
function FakePDP({ mode, position, sizeDesktop, sizeMobile, isMobile }) {
  return (
    <div style={{
      width: isMobile ? 390 : "100%",
      maxWidth: isMobile ? 390 : 900,
      height: isMobile ? 680 : 520,
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Fake product image area */}
      <div style={{
        height: isMobile ? 340 : 520,
        width: isMobile ? "100%" : 400,
        background: "linear-gradient(135deg, #f0f0f5 0%, #e0e0ee 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40, color: "#ccc",
        position: isMobile ? "relative" : "absolute",
        left: 0, top: 0,
      }}>👗</div>

      {/* Fake product info */}
      <div style={{
        position: isMobile ? "relative" : "absolute",
        left: isMobile ? 0 : 420,
        top: isMobile ? 0 : 0,
        padding: isMobile ? "16px 16px 0" : "32px 28px",
        width: isMobile ? "100%" : "calc(100% - 448px)",
      }}>
        <div style={{ fontSize: isMobile ? 14 : 22, fontWeight: 700, color: "#111", marginBottom: 6 }}>
          Claura Women Printed Night Suit
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: isMobile ? 16 : 24, fontWeight: 800, color: "#111" }}>₹965</span>
          <span style={{ fontSize: isMobile ? 11 : 14, color: "#999", textDecoration: "line-through" }}>₹3,329</span>
          <span style={{ fontSize: isMobile ? 10 : 12, color: "#e93", fontWeight: 700 }}>71% OFF</span>
        </div>
        {!isMobile && (
          <div style={{
            display: "flex", gap: 10, marginTop: 16,
          }}>
            <div style={{ padding: "10px 24px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Buy Now</div>
            <div style={{ padding: "10px 24px", background: "#f5f5f5", color: "#111", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Add to Bag</div>
          </div>
        )}
        {isMobile && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, padding: "10px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: "center" }}>Buy Now</div>
            <div style={{ flex: 1, padding: "10px", background: "#f5f5f5", color: "#111", borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: "center" }}>Add to Bag</div>
          </div>
        )}
      </div>

      {/* Floating widget */}
      <FloatPreview
        mode={mode}
        position={position}
        sizeDesktop={sizeDesktop}
        sizeMobile={sizeMobile}
        isMobile={isMobile}
      />
    </div>
  );
}

/* ── Main page ── */
export default function Widgets() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();
  const [tab, setTab] = useState("desktop");
  const isMobile = tab === "mobile";
  const saved = fetcher.data?.ok;

  const [floatMode, setFloatMode]     = useState(settings.float_mode || "rectangle");
  const [position, setPosition]       = useState(settings.float_position || "bottom-right");
  const [sizeDesk, setSizeDesk]       = useState(settings.float_size_desktop || 140);
  const [sizeMob, setSizeMob]         = useState(settings.float_size_mobile || 80);
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#008060");
  const [autoplay, setAutoplay]       = useState(settings.autoplay || false);
  const [layout, setLayout]           = useState(settings.layout || "carousel");

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("float_mode",         floatMode);
    fd.append("float_position",     position);
    fd.append("float_size_desktop", sizeDesk);
    fd.append("float_size_mobile",  sizeMob);
    fd.append("accent_color",       accentColor);
    fd.append("layout",             layout);
    if (autoplay) fd.append("autoplay", "on");
    fetcher.submit(fd, { method: "post" });
  }

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={css.logo}>Claura</span>
          <span style={css.tag}>Widget Studio</span>
        </div>
        {saved && (
          <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>
            ✓ Saved successfully
          </span>
        )}
      </div>

      <div style={css.body}>
        {/* ── Left panel ── */}
        <div style={css.panel}>

          {/* Floating mode */}
          <div style={css.section}>
            <div style={css.sectionTitle}>
              <div style={css.sectionDivider} />
              Floating Widget Style
            </div>

            {[
              { value: "rectangle", icon: "▬", name: "Rectangle", desc: "Portrait video float with mute & close" },
              { value: "circle",    icon: "●", name: "Circle",    desc: "Round bubble — click scrolls to video carousel" },
            ].map((m) => (
              <div
                key={m.value}
                style={{ ...css.modeCard, ...(floatMode === m.value ? css.modeCardActive : {}) }}
                onClick={() => setFloatMode(m.value)}
              >
                <input
                  type="radio"
                  name="float_mode"
                  value={m.value}
                  checked={floatMode === m.value}
                  onChange={() => setFloatMode(m.value)}
                  style={{ accentColor: C.accent }}
                />
                <div style={css.modeIcon}>{m.icon}</div>
                <div style={css.modeText}>
                  <div style={css.modeName}>{m.name}</div>
                  <div style={css.modeDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Position */}
          <div style={css.section}>
            <div style={css.sectionTitle}>
              <div style={css.sectionDivider} />
              Position
            </div>
            <label style={css.label}>Widget Position</label>
            <select style={css.select} value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="mid-right">Middle Right</option>
              <option value="mid-left">Middle Left</option>
            </select>
          </div>

          {/* Size */}
          <div style={css.section}>
            <div style={css.sectionTitle}>
              <div style={css.sectionDivider} />
              Size
            </div>

            <div style={css.sliderWrap}>
              <label style={css.label}>
                🖥 Desktop {floatMode === "circle" ? "Diameter" : "Width"}
              </label>
              <span style={css.sublabel}>
                {floatMode === "circle"
                  ? `Circle: ${sizeDesk}×${sizeDesk}px`
                  : `Rectangle: ${sizeDesk}×${Math.round(sizeDesk * 1.78)}px`}
              </span>
              <input
                type="range" min="60" max="280" step="10"
                value={sizeDesk}
                onChange={(e) => setSizeDesk(parseInt(e.target.value))}
                style={css.slider}
              />
              <div style={css.sliderRow}>
                <span style={{ fontSize: 11, color: C.muted }}>60px</span>
                <span style={css.sliderVal}>{sizeDesk}px</span>
              </div>
            </div>

            <div style={css.sliderWrap}>
              <label style={css.label}>
                📱 Mobile {floatMode === "circle" ? "Diameter" : "Width"}
              </label>
              <span style={css.sublabel}>
                {floatMode === "circle"
                  ? `Circle: ${sizeMob}×${sizeMob}px`
                  : `Rectangle: ${sizeMob}×${Math.round(sizeMob * 1.78)}px`}
              </span>
              <input
                type="range" min="50" max="160" step="10"
                value={sizeMob}
                onChange={(e) => setSizeMob(parseInt(e.target.value))}
                style={css.slider}
              />
              <div style={css.sliderRow}>
                <span style={{ fontSize: 11, color: C.muted }}>50px</span>
                <span style={css.sliderVal}>{sizeMob}px</span>
              </div>
            </div>
          </div>

          {/* Carousel settings */}
          <div style={css.section}>
            <div style={css.sectionTitle}>
              <div style={css.sectionDivider} />
              Carousel
            </div>
            <label style={css.label}>Layout</label>
            <select style={css.select} value={layout} onChange={(e) => setLayout(e.target.value)}>
              <option value="carousel">Carousel</option>
              <option value="grid">Grid</option>
            </select>

            <label style={css.label}>Accent Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <input
                type="color" value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: 48, height: 36, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
              />
              <span style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>{accentColor}</span>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14 }}>
              <input
                type="checkbox" checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                style={{ accentColor: C.accent, width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Autoplay on hover</span>
            </label>
          </div>

          {/* Save */}
          <button
            style={css.saveBtn}
            onClick={handleSubmit}
            disabled={fetcher.state === "submitting"}
            onMouseEnter={(e) => e.target.style.background = C.accentHover}
            onMouseLeave={(e) => e.target.style.background = C.accent}
          >
            {fetcher.state === "submitting" ? "Saving…" : "Save Settings"}
          </button>

          {/* Hidden fields for form compatibility */}
          <input type="hidden" name="float_mode"         value={floatMode} />
          <input type="hidden" name="float_position"     value={position} />
          <input type="hidden" name="float_size_desktop" value={sizeDesk} />
          <input type="hidden" name="float_size_mobile"  value={sizeMob} />
          <input type="hidden" name="accent_color"       value={accentColor} />
          <input type="hidden" name="layout"             value={layout} />
        </div>

        {/* ── Right preview ── */}
        <div style={css.preview}>
          {/* Tabs */}
          <div style={css.previewTabs}>
            {["desktop", "mobile"].map((t) => (
              <button
                key={t}
                style={{
                  ...css.previewTab,
                  ...(tab === t ? css.previewTabActive : {}),
                }}
                onClick={() => setTab(t)}
              >
                {t === "desktop" ? "🖥 Desktop" : "📱 Mobile"}
              </button>
            ))}
            <div style={{
              marginLeft: "auto", padding: "10px 20px",
              fontSize: 11, color: C.muted,
              display: "flex", alignItems: "center",
            }}>
              Live Preview
            </div>
          </div>

          {/* Canvas */}
          <div style={{
            ...css.previewCanvas,
            background: tab === "mobile"
              ? "radial-gradient(ellipse at 50% 30%, #1a1a2e 0%, #0c0c10 100%)"
              : "radial-gradient(ellipse at 60% 40%, #12121a 0%, #080810 100%)",
          }}>
            {/* Grid lines for depth */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04,
              backgroundImage: "linear-gradient(#7c6dfa 1px, transparent 1px), linear-gradient(90deg, #7c6dfa 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }} />

            <FakePDP
              mode={floatMode}
              position={position}
              sizeDesktop={sizeDesk}
              sizeMobile={sizeMob}
              isMobile={isMobile}
            />
          </div>

          {/* Info bar */}
          <div style={{
            padding: "12px 24px",
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            fontSize: 12,
            color: C.muted,
            display: "flex",
            gap: 24,
          }}>
            <span>Mode: <strong style={{ color: C.text }}>{floatMode}</strong></span>
            <span>Position: <strong style={{ color: C.text }}>{position}</strong></span>
            <span>
              {tab === "desktop"
                ? `Desktop: ${sizeDesk}px`
                : `Mobile: ${sizeMob}px`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
