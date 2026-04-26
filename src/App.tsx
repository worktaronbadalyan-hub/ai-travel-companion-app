import React, { useEffect, useMemo, useState } from "react";

const tripStyles = ["Maximum sightseeing", "Balanced", "Relaxed", "Content creator", "Business + quick tourism"];
const budgets = ["Budget", "Medium", "Premium", "VIP"];
const languages = ["English", "Armenian", "Russian"];
const mapProviders = [
  { label: "Apple Maps", value: "apple" },
  { label: "Google Maps", value: "google" }
];
const interestOptions = ["Classic", "Nature", "Food", "Culture", "Business", "Photography", "Shopping", "Family"];

const templates = [
  ["Top Landmark", "top landmark", "Must-see", "45-75 min", "Start here or visit early", "Begin with the destination's most recognizable place to anchor the trip visually and emotionally.", "Wide establishing shot, clean portrait, short arrival video."],
  ["Historic Center / Old Town", "old town historic center", "Culture + walking", "60-120 min", "Walk", "This is where the real identity of the city appears: streets, architecture, local rhythm and small details.", "Cinematic walking shot, street details, doors, balconies and local textures."],
  ["Best Viewpoint", "best viewpoint panorama", "Panorama", "45-90 min", "Taxi / metro if far", "A viewpoint gives context. It helps you understand the geography of the city, not just individual places.", "Slow panoramic video, silhouette, skyline shot."],
  ["Local Market / Food Street", "local market food street", "Food + local life", "45-90 min", "Walk or quick ride", "Markets reveal daily life faster than museums when time is limited.", "Food close-ups, hands, signs, movement, short tasting reaction."],
  ["Signature Museum / Cultural Site", "best museum cultural site", "Culture", "60-150 min", "Plan based on distance", "Choose one strong cultural site. Too many museums can destroy the rhythm of a short trip.", "Exterior first, one strong detail, quiet reflective clip."],
  ["Waterfront / Main Boulevard / Promenade", "waterfront promenade main boulevard", "Atmosphere", "45-90 min", "Walk", "This is the best low-effort section for feeling the destination without overplanning.", "Walking POV, sunset light, natural candid shots."],
  ["Sunset Spot", "best sunset spot", "Golden hour", "45-75 min", "Arrive before sunset", "Sunset is the strongest visual multiplier. One correct sunset location can outperform five random stops.", "Backlight portrait, time-lapse, skyline transition."],
  ["Night Walk / Illuminated Area", "night walk illuminated area", "Night vibe", "30-75 min", "Taxi back if late", "A city changes at night. Ending with lights gives the trip a cinematic close.", "Lights, slow walk, final recap selfie video."]
].map(([title, query, type, duration, movement, reason, photo]) => ({ title, query, type, duration, movement, reason, photo }));

function normalizeDays(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(30, Math.floor(parsed)));
}

function normalizeDestination(value) {
  const clean = String(value || "").trim();
  return clean.length ? clean : "Your destination";
}

function getPlaceCount(days, style) {
  if (style === "Relaxed") return Math.min(4 + days, 8);
  if (style === "Balanced") return Math.min(5 + days * 2, 8);
  if (style === "Business + quick tourism") return Math.min(3 + days, 8);
  return Math.min(7 + days * 3, 8);
}

function buildSearchLink(destination, query, provider) {
  const encoded = encodeURIComponent(`${destination} ${query}`);
  if (provider === "google") return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  return `https://maps.apple.com/?q=${encoded}`;
}

function buildInfoLink(destination, title) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${destination} ${title} travel guide`)}`;
}

function estimateBudget(days, budget) {
  const rates = {
    Budget: { hotel: 70, food: 35, local: 18, activities: 25 },
    Medium: { hotel: 140, food: 65, local: 30, activities: 45 },
    Premium: { hotel: 260, food: 120, local: 60, activities: 90 },
    VIP: { hotel: 550, food: 240, local: 160, activities: 220 }
  };
  const rate = rates[budget] || rates.Medium;
  return {
    hotel: rate.hotel * days,
    food: rate.food * days,
    local: rate.local * days,
    activities: rate.activities * days,
    total: (rate.hotel + rate.food + rate.local + rate.activities) * days
  };
}

function contentCopy(destination, days, language) {
  if (language === "Armenian") {
    return {
      hook: `Ես ունեմ ${days} օր ${destination}-ում և ուզում եմ տեսնել առավելագույնը առանց ժամանակ կորցնելու։`,
      structure: "Ժամանում → գլխավոր վայր → տեղական փողոցներ → viewpoint → սնունդ → sunset → night walk։",
      caption: `${destination}-ի խելացի երթուղի՝ քարտեզներով, բյուջեով և նկարահանման կետերով։`
    };
  }
  if (language === "Russian") {
    return {
      hook: `У меня ${days} дн. в ${destination}, и я хочу увидеть максимум без потери времени.`,
      structure: "Приезд → главный символ → местные улицы → смотровая точка → еда → закат → ночная прогулка.",
      caption: `Умный маршрут по ${destination}: карты, бюджет и точки для фото.`
    };
  }
  return {
    hook: `I have ${days} day(s) in ${destination}, and I want to see the maximum without wasting time.`,
    structure: "Arrival → iconic landmark → local streets → viewpoint → food stop → sunset → night walk.",
    caption: `A smart route through ${destination}: maps, budget and photo spots in one plan.`
  };
}

function dayForIndex(index, total, days) {
  const perDay = Math.max(1, Math.ceil(total / days));
  return Math.min(days, Math.floor(index / perDay) + 1);
}

function buildPlan(destination, days, style, mapProvider) {
  const count = getPlaceCount(days, style);
  return templates.slice(0, count).map((item, index) => ({
    id: index,
    day: dayForIndex(index, count, days),
    title: item.title,
    placeName: `${destination} ${item.title}`,
    type: item.type,
    duration: item.duration,
    movement: item.movement,
    reason: item.reason,
    photo: item.photo,
    map: buildSearchLink(destination, item.query, mapProvider),
    info: buildInfoLink(destination, item.title)
  }));
}

function groupByDay(plan, days) {
  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    places: plan.filter((item) => item.day === index + 1)
  }));
}

export default function App() {
  const [destination, setDestination] = useState("Paris");
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState("Maximum sightseeing");
  const [budget, setBudget] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [mapProvider, setMapProvider] = useState("apple");
  const [interests, setInterests] = useState(["Classic", "Photography"]);
  const [plan, setPlan] = useState([]);
  const [copied, setCopied] = useState(false);

  const safeDays = normalizeDays(days);
  const safeDestination = normalizeDestination(destination);
  const groupedPlan = useMemo(() => groupByDay(plan, safeDays), [plan, safeDays]);
  const budgetEstimate = useMemo(() => estimateBudget(safeDays, budget), [safeDays, budget]);
  const content = useMemo(() => contentCopy(safeDestination, safeDays, language), [safeDestination, safeDays, language]);

  useEffect(() => {
    setPlan(buildPlan(safeDestination, safeDays, style, mapProvider));
  }, []);

  function generatePlan() {
    setPlan(buildPlan(safeDestination, safeDays, style, mapProvider));
  }

  function toggleInterest(interest) {
    setInterests((current) => current.includes(interest) ? current.filter((x) => x !== interest) : [...current, interest]);
  }

  async function copyPlan() {
    const text = groupedPlan.map((day) => {
      const places = day.places.map((p, i) => `${i + 1}. ${p.title}\n${p.map}\n${p.reason}`).join("\n\n");
      return `Day ${day.day}\n${places}`;
    }).join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={styles.heroTop}>
            <div style={styles.logo}>✦</div>
            <div>
              <h1 style={styles.title}>AI Travel Companion</h1>
              <p style={styles.subtitle}>Universal trip planner for any destination: itinerary, maps, budget, photo spots and content prompts.</p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <Field label="Destination" icon="🌍" wide>
              <input style={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City, country or route" />
            </Field>
            <Field label="Days" icon="📅">
              <input style={styles.input} type="number" min="1" max="30" value={days} onChange={(e) => setDays(e.target.value)} />
            </Field>
            <Field label="Style" icon="⚡">
              <select style={styles.input} value={style} onChange={(e) => setStyle(e.target.value)}>{tripStyles.map((x) => <option key={x}>{x}</option>)}</select>
            </Field>
            <Field label="Budget" icon="💳">
              <select style={styles.input} value={budget} onChange={(e) => setBudget(e.target.value)}>{budgets.map((x) => <option key={x}>{x}</option>)}</select>
            </Field>
            <Field label="Map" icon="🗺️">
              <select style={styles.input} value={mapProvider} onChange={(e) => setMapProvider(e.target.value)}>{mapProviders.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
            </Field>
          </div>

          <div style={styles.interestHeader}>
            <strong>Interests</strong>
            <select style={styles.smallInput} value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          <div style={styles.chips}>{interestOptions.map((interest) => <button key={interest} onClick={() => toggleInterest(interest)} style={interests.includes(interest) ? styles.chipActive : styles.chip}>{interest}</button>)}</div>
          <div style={styles.actions}><button style={styles.primaryButton} onClick={generatePlan}>Generate Trip</button><span style={styles.status}>{plan.length} stops ready</span></div>
        </header>

        <main style={styles.layout}>
          <section style={styles.mainCard}>
            <div style={styles.sectionHeader}>
              <div><h2 style={styles.h2}>Smart Itinerary for {safeDestination}</h2><p style={styles.muted}>Curated stops with map links, movement notes and photo guidance.</p></div>
              <button style={styles.secondaryButton} onClick={copyPlan}>{copied ? "Copied" : "Copy Plan"}</button>
            </div>

            {groupedPlan.map((day) => <div key={day.day} style={styles.dayBlock}>
              <div style={styles.dayHeader}><div style={styles.dayBadge}>D{day.day}</div><div><h3 style={styles.h3}>Day {day.day}</h3><p style={styles.mutedSmall}>{day.places.length} suggested stops</p></div></div>
              <div style={styles.cardsStack}>{day.places.map((place, index) => <article key={place.id} style={styles.stopCard}>
                <div style={styles.stopNumber}>{index + 1}</div>
                <div style={styles.stopBody}>
                  <div style={styles.stopTop}><div><h4 style={styles.h4}>{place.title}</h4><p style={styles.mutedSmall}>{place.type} • {place.duration} • {place.movement}</p></div><div style={styles.linkRow}><a style={styles.linkButton} href={place.map} target="_blank" rel="noreferrer">Map</a><a style={styles.linkButton} href={place.info} target="_blank" rel="noreferrer">Info</a></div></div>
                  <p style={styles.placeName}>{place.placeName}</p><p style={styles.reason}>{place.reason}</p>
                  <div style={styles.noteGrid}><div style={styles.note}><b>Best shot:</b> {place.photo}</div><div style={styles.note}><b>Action:</b> Save this stop and verify opening hours before the trip.</div></div>
                </div>
              </article>)}</div>
            </div>)}
          </section>

          <aside style={styles.sidebar}>
            <Panel title="Trip Summary"><InfoRow icon="🌍" label="Destination" value={safeDestination} /><InfoRow icon="📅" label="Days" value={safeDays} /><InfoRow icon="⚡" label="Style" value={style} /><InfoRow icon="🧭" label="Stops" value={plan.length} /></Panel>
            <Panel title="Budget Estimate"><InfoRow icon="🏨" label="Hotel" value={`€${budgetEstimate.hotel}`} /><InfoRow icon="🍽️" label="Food" value={`€${budgetEstimate.food}`} /><InfoRow icon="🚕" label="Local" value={`€${budgetEstimate.local}`} /><InfoRow icon="🎟️" label="Activities" value={`€${budgetEstimate.activities}`} /><div style={styles.total}><span>Total</span><strong>€{budgetEstimate.total}</strong></div><p style={styles.disclaimer}>Draft only. Flights, visas and transfers are not included.</p></Panel>
            <Panel title="Content Mode"><p style={styles.copyLine}><b>Hook:</b> {content.hook}</p><p style={styles.copyLine}><b>Structure:</b> {content.structure}</p><p style={styles.copyLine}><b>Caption:</b> {content.caption}</p></Panel>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Field({ label, icon, children, wide }) {
  return <label style={{ ...styles.field, ...(wide ? styles.wideField : {}) }}><span style={styles.label}>{icon} {label}</span>{children}</label>;
}

function Panel({ title, children }) {
  return <div style={styles.panel}><h2 style={styles.panelTitle}>{title}</h2><div style={styles.panelBody}>{children}</div></div>;
}

function InfoRow({ icon, label, value }) {
  return <div style={styles.infoRow}><span>{icon} {label}</span><strong>{value}</strong></div>;
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#eef2ff 0%,#f8fafc 42%,#e0f2fe 100%)", color: "#0f172a", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", padding: 24 },
  shell: { maxWidth: 1180, margin: "0 auto" },
  hero: { position: "relative", overflow: "hidden", background: "rgba(255,255,255,.9)", border: "1px solid rgba(226,232,240,.9)", borderRadius: 28, padding: 30, boxShadow: "0 20px 70px rgba(15,23,42,.08)" },
  heroGlow: { position: "absolute", right: -80, top: -80, width: 220, height: 220, borderRadius: 999, background: "radial-gradient(circle,#dbeafe,#f8fafc 70%)" },
  heroTop: { position: "relative", display: "flex", gap: 16, alignItems: "center", marginBottom: 28 },
  logo: { width: 54, height: 54, borderRadius: 18, background: "#0f172a", color: "white", display: "grid", placeItems: "center", fontSize: 26, boxShadow: "0 12px 30px rgba(15,23,42,.25)" },
  title: { margin: 0, fontSize: "clamp(34px,5vw,58px)", letterSpacing: -1.5, lineHeight: 1, fontWeight: 850 },
  subtitle: { margin: "10px 0 0", color: "#64748b", maxWidth: 760, fontSize: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, position: "relative" },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  wideField: { gridColumn: "span 2" },
  label: { color: "#334155", fontSize: 13, fontWeight: 800 },
  input: { width: "100%", boxSizing: "border-box", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 14, padding: "13px 14px", outline: "none", fontSize: 14 },
  smallInput: { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 10px" },
  interestHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, gap: 12 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { border: "1px solid #e2e8f0", background: "white", color: "#334155", padding: "10px 14px", borderRadius: 999, fontWeight: 800, cursor: "pointer" },
  chipActive: { border: "1px solid #0f172a", background: "#0f172a", color: "white", padding: "10px 14px", borderRadius: 999, fontWeight: 800, cursor: "pointer" },
  actions: { display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap" },
  primaryButton: { border: 0, background: "#0f172a", color: "white", borderRadius: 16, padding: "14px 20px", fontWeight: 900, cursor: "pointer", boxShadow: "0 14px 35px rgba(15,23,42,.25)" },
  secondaryButton: { border: 0, background: "#0f172a", color: "white", borderRadius: 14, padding: "11px 16px", fontWeight: 900, cursor: "pointer" },
  status: { color: "#64748b", fontSize: 14 },
  layout: { display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(300px,1fr)", gap: 18, marginTop: 18 },
  mainCard: { background: "rgba(255,255,255,.92)", border: "1px solid #e2e8f0", borderRadius: 28, padding: 24, boxShadow: "0 20px 70px rgba(15,23,42,.06)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start", marginBottom: 22, flexWrap: "wrap" },
  h2: { margin: 0, fontSize: 28, letterSpacing: -.5 },
  h3: { margin: 0, fontSize: 21 },
  h4: { margin: 0, fontSize: 18 },
  muted: { color: "#64748b", margin: "7px 0 0" },
  mutedSmall: { color: "#64748b", margin: "4px 0 0", fontSize: 13 },
  dayBlock: { marginTop: 24 },
  dayHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  dayBadge: { width: 48, height: 48, background: "#0f172a", color: "white", borderRadius: 16, display: "grid", placeItems: "center", fontWeight: 900 },
  cardsStack: { display: "flex", flexDirection: "column", gap: 12 },
  stopCard: { display: "flex", gap: 14, border: "1px solid #e2e8f0", borderRadius: 24, padding: 18, background: "white", boxShadow: "0 10px 30px rgba(15,23,42,.04)" },
  stopNumber: { width: 38, height: 38, flex: "0 0 auto", borderRadius: 14, background: "#f1f5f9", display: "grid", placeItems: "center", fontWeight: 900 },
  stopBody: { flex: 1, minWidth: 0 },
  stopTop: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  linkRow: { display: "flex", gap: 8 },
  linkButton: { background: "#f1f5f9", color: "#0f172a", textDecoration: "none", borderRadius: 14, padding: "9px 13px", fontWeight: 900, fontSize: 13 },
  placeName: { color: "#64748b", fontSize: 13, margin: "12px 0 8px" },
  reason: { color: "#334155", margin: 0, lineHeight: 1.55 },
  noteGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 12 },
  note: { background: "#f8fafc", borderRadius: 16, padding: 13, fontSize: 13, color: "#334155" },
  sidebar: { display: "flex", flexDirection: "column", gap: 14 },
  panel: { background: "rgba(255,255,255,.92)", border: "1px solid #e2e8f0", borderRadius: 24, padding: 20, boxShadow: "0 20px 70px rgba(15,23,42,.05)" },
  panelTitle: { margin: "0 0 16px", fontSize: 22 },
  panelBody: { display: "flex", flexDirection: "column", gap: 12 },
  infoRow: { display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 10, color: "#475569" },
  total: { background: "#0f172a", color: "white", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" },
  disclaimer: { color: "#64748b", fontSize: 12, margin: 0 },
  copyLine: { color: "#334155", fontSize: 14, margin: 0, lineHeight: 1.5 }
};

