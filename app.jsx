/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle */
const { useState, useMemo, useEffect, useRef } = React;

/* ---------- DATA ---------- */
const STEPS = [
  { id: 1, key: "identity", label: "Informations", hint: "Vos coordonnées" },
  { id: 2, key: "profile", label: "Profil", hint: "Niveau & modules" },
  { id: 3, key: "availability", label: "Disponibilités", hint: "Créneaux & durée" },
  { id: 4, key: "goals", label: "Attentes", hint: "Objectifs & projet" },
];

const NIVEAUX = [
  { v: "debutant", t: "Débutant", d: "Je découvre Power BI" },
  { v: "intermediaire", t: "Intermédiaire", d: "Je crée des rapports simples" },
  { v: "avance", t: "Avancé", d: "DAX, Power Query, modélisation" },
];

const MODULES = [
  { v: "fondamentaux", t: "Fondamentaux Power BI", d: "Interface, premiers rapports", icon: "M3 12h4l3-9 4 18 3-9h4" },
  { v: "power-query", t: "Power Query & ETL", d: "Connexion, transformation, M", icon: "M4 4h16v4H4zM4 12h10v4H4zM4 20h6" },
  { v: "modelisation", t: "Modélisation", d: "Schéma en étoile, relations", icon: "M8 4h8v4H8zM4 14h6v4H4zM14 14h6v4h-6zM12 8v4M12 14V12M7 14V12 M17 14V12" },
  { v: "dax", t: "DAX avancé", d: "Mesures, time intelligence", icon: "M5 7h14M5 12h14M5 17h9" },
  { v: "visualisation", t: "Visualisation & Design", d: "Charting, storytelling data", icon: "M4 20V8M10 20V4M16 20v-7M22 20v-3" },
  { v: "service", t: "Power BI Service", d: "Workspaces, partage, sécurité", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" },
  { v: "performance", t: "Performance & Optimisation", d: "Tuning DAX, taille des modèles", icon: "M3 12a9 9 0 1 0 9-9M12 7v5l3 3" },
  { v: "ia", t: "IA & Copilot", d: "Insights automatiques, analyse clé", icon: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" },
];

const CRENEAUX = [
  { v: "matin-semaine", t: "Matinées en semaine", d: "9h — 12h" },
  { v: "aprem-semaine", t: "Après-midis en semaine", d: "14h — 17h" },
  { v: "soir", t: "Soirées", d: "18h — 21h" },
  { v: "weekend", t: "Week-ends", d: "Sam. ou dim." },
];

const DUREES = [
  { v: "express", t: "Express", d: "2 jours intensifs", h: "14h" },
  { v: "court", t: "Court", d: "1 semaine", h: "35h" },
  { v: "complet", t: "Complet", d: "4 semaines", h: "60h" },
  { v: "approfondi", t: "Approfondi", d: "6 semaines + coaching", h: "90h" },
];

const SOURCES_DECOUVERTE = [
  "Recherche Google",
  "Réseaux sociaux",
  "LinkedIn",
  "Recommandation collègue",
  "Manager / RH",
  "Événement / webinaire",
  "Article ou newsletter",
  "Autre",
];

const OBJECTIFS = [
  { v: "dashboard", t: "Construire mes premiers dashboards", icon: "bars" },
  { v: "automatisation", t: "Automatiser mes reportings", icon: "spark" },
  { v: "certification", t: "Préparer une certification PL-300", icon: "target" },
  { v: "equipe", t: "Monter en compétence avec mon équipe", icon: "user" },
  { v: "reconversion", t: "Me reconvertir vers la data", icon: "flag" },
  { v: "projet", t: "Réussir un projet précis", icon: "briefcase" },
];

/* ---------- ICONS ---------- */
const Icon = {
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="4 12 10 18 20 6" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  back: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  spark: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z" />
    </svg>
  ),
  bars: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <line x1="6" y1="20" x2="6" y2="13" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  ),
  briefcase: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </svg>
  ),
  target: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  flag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 21V4h11l-2 4 2 4H5" />
    </svg>
  ),
};

const STEP_ICONS = [Icon.user, Icon.briefcase, Icon.target, Icon.flag];

/* ---------- DATAVIZ DECOR ---------- */
function MiniBars({ values, color = "currentColor", w = 120, h = 36 }) {
  const max = Math.max(...values);
  const bw = w / values.length - 3;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      {values.map((v, i) => {
        const bh = (v / max) * h;
        return <rect key={i} x={i * (bw + 3)} y={h - bh} width={bw} height={bh} fill={color} opacity={0.3 + (v / max) * 0.7} />;
      })}
    </svg>
  );
}

function Sparkline({ values, color = "currentColor", w = 200, h = 50, fill }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      {fill && <path d={area} fill={fill} opacity="0.18" />}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 0} fill={color} />
      ))}
    </svg>
  );
}

function Donut({ pct = 64, size = 64, color = "currentColor", track = "rgba(255,255,255,0.15)" }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/* ---------- PROGRESS ---------- */
function ProgressStepper({ current, style }) {
  if (style === "bar") {
    const pct = (current / STEPS.length) * 100;
    return (
      <div className="prog-bar-wrap">
        <div className="prog-bar-meta">
          <span className="prog-bar-label">Étape {current} sur {STEPS.length}</span>
          <span className="prog-bar-pct">{Math.round(pct)}%</span>
        </div>
        <div className="prog-bar-track">
          <div className="prog-bar-fill" style={{ width: `${pct}%` }}>
            <div className="prog-bar-pulse" />
          </div>
        </div>
        <div className="prog-bar-labels">
          {STEPS.map((s) => (
            <span key={s.id} className={`prog-bar-step ${s.id <= current ? "is-done" : ""} ${s.id === current ? "is-current" : ""}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    );
  }
  // default: numbered horizontal stepper
  return (
    <div className="prog-stepper">
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        const StepIcon = STEP_ICONS[i];
        return (
          <React.Fragment key={s.id}>
            <div className={`prog-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
              <div className="prog-step-circle">
                {done ? <Icon.check width="16" height="16" /> : <StepIcon width="18" height="18" />}
              </div>
              <div className="prog-step-text">
                <div className="prog-step-num">0{s.id}</div>
                <div className="prog-step-label">{s.label}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`prog-line ${done ? "is-done" : ""}`}>
                <div className="prog-line-fill" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------- FIELD PRIMITIVES ---------- */
function Field({ label, hint, error, required, children }) {
  return (
    <label className="field">
      <div className="field-head">
        <span className="field-label">
          {label}
          {required && <span className="field-req">*</span>}
        </span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      {children}
      {error && <div className="field-error">{error}</div>}
    </label>
  );
}

function Input({ value, onChange, error, ...rest }) {
  return <input className={`input ${error ? "has-error" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function Select({ value, onChange, options, placeholder, error }) {
  return (
    <select className={`input ${error ? "has-error" : ""}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function ChoiceCards({ options, value, onChange }) {
  return (
    <div className="choice-grid">
      {options.map((o) => (
        <button
          type="button"
          key={o.v}
          className={`choice ${value === o.v ? "is-selected" : ""}`}
          onClick={() => onChange(o.v)}
        >
          <div className="choice-radio">
            <div className="choice-radio-dot" />
          </div>
          <div className="choice-body">
            <div className="choice-title">{o.t}</div>
            <div className="choice-desc">{o.d}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function Chips({ options, values, onToggle, max }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const sel = values.includes(o);
        const disabled = !sel && max && values.length >= max;
        return (
          <button
            type="button"
            key={o}
            className={`chip ${sel ? "is-selected" : ""}`}
            disabled={disabled}
            onClick={() => onToggle(o)}
          >
            <span className="chip-mark">
              {sel && <Icon.check width="12" height="12" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- STEPS ---------- */
function StepIdentity({ data, set, errors }) {
  return (
    <div className="step">
      <div className="step-head">
        <div className="step-eyebrow">01 — Informations personnelles</div>
        <h2 className="step-title">Faisons connaissance.</h2>
        <p className="step-sub">Vos coordonnées nous permettent de personnaliser votre parcours et de vous envoyer la convocation.</p>
      </div>
      <div className="step-body grid-2">
        <Field label="Prénom" required error={errors.firstName}>
          <Input placeholder="Sophie" value={data.firstName} onChange={(v) => set("firstName", v)} error={errors.firstName} />
        </Field>
        <Field label="Nom" required error={errors.lastName}>
          <Input placeholder="Martin" value={data.lastName} onChange={(v) => set("lastName", v)} error={errors.lastName} />
        </Field>
        <Field label="Email professionnel" required hint="Domaine d'entreprise privilégié" error={errors.email}>
          <Input type="email" placeholder="sophie.martin@entreprise.fr" value={data.email} onChange={(v) => set("email", v)} error={errors.email} />
        </Field>
        <Field label="Téléphone" hint="Optionnel">
          <Input type="tel" placeholder="+33 6 ··" value={data.phone} onChange={(v) => set("phone", v)} />
        </Field>
        <Field label="Organisation" required error={errors.company}>
          <Input placeholder="Nom de l'entreprise" value={data.company} onChange={(v) => set("company", v)} error={errors.company} />
        </Field>
        <Field label="Poste / Fonction" required error={errors.role}>
          <Input placeholder="Analyste, Manager, Consultant…" value={data.role} onChange={(v) => set("role", v)} error={errors.role} />
        </Field>
      </div>
    </div>
  );
}

function StepProfile({ data, set, toggle, errors }) {
  return (
    <div className="step">
      <div className="step-head">
        <div className="step-eyebrow">02 — Profil</div>
        <h2 className="step-title">Votre niveau & vos modules.</h2>
        <p className="step-sub">Indiquez où vous en êtes et choisissez les thèmes Power BI qui vous intéressent.</p>
      </div>
      <div className="step-body">
        <Field label="Votre niveau actuel" required error={errors.level}>
          <ChoiceCards options={NIVEAUX} value={data.level} onChange={(v) => set("level", v)} />
        </Field>

        <Field label="Modules souhaités" hint={`${data.modules.length}/8 sélectionnés`} required error={errors.modules}>
          <div className="module-grid">
            {MODULES.map((m) => {
              const sel = data.modules.includes(m.v);
              return (
                <button
                  type="button"
                  key={m.v}
                  className={`module ${sel ? "is-selected" : ""}`}
                  onClick={() => toggle("modules", m.v)}
                >
                  <span className="module-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                      <path d={m.icon} />
                    </svg>
                  </span>
                  <span className="module-body">
                    <span className="module-title">{m.t}</span>
                    <span className="module-desc">{m.d}</span>
                  </span>
                  <span className="module-check">
                    {sel && <Icon.check width="12" height="12" />}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

function StepAvailability({ data, set, toggle, errors }) {
  return (
    <div className="step">
      <div className="step-head">
        <div className="step-eyebrow">03 — Disponibilités</div>
        <h2 className="step-title">Quand voulez-vous démarrer ?</h2>
        <p className="step-sub">Vos créneaux et la durée souhaitée — cela nous aide à vous proposer la bonne session.</p>
      </div>
      <div className="step-body">
        <Field label="Créneaux préférés" hint="Plusieurs choix possibles" required error={errors.slots}>
          <div className="choice-grid">
            {CRENEAUX.map((c) => {
              const sel = data.slots.includes(c.v);
              return (
                <button
                  type="button"
                  key={c.v}
                  className={`choice ${sel ? "is-selected" : ""}`}
                  onClick={() => toggle("slots", c.v)}
                >
                  <div className="choice-radio choice-check">
                    {sel && <Icon.check width="11" height="11" />}
                  </div>
                  <div className="choice-body">
                    <div className="choice-title">{c.t}</div>
                    <div className="choice-desc">{c.d}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Durée de formation" required error={errors.duration}>
          <div className="duration-grid">
            {DUREES.map((d) => (
              <button
                type="button"
                key={d.v}
                className={`duration ${data.duration === d.v ? "is-selected" : ""}`}
                onClick={() => set("duration", d.v)}
              >
                <div className="duration-h">{d.h}</div>
                <div className="duration-t">{d.t}</div>
                <div className="duration-d">{d.d}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Comment avez-vous découvert Boost.BI ?" required error={errors.source}>
          <div className="pill-row">
            {SOURCES_DECOUVERTE.map((s) => (
              <button
                type="button"
                key={s}
                className={`pill ${data.source === s ? "is-selected" : ""}`}
                onClick={() => set("source", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function StepGoals({ data, set, errors }) {
  return (
    <div className="step">
      <div className="step-head">
        <div className="step-eyebrow">04 — Attentes</div>
        <h2 className="step-title">Parlons de votre projet.</h2>
        <p className="step-sub">Plus vous êtes précis, plus nous pourrons calibrer l'accompagnement avec votre coach.</p>
      </div>
      <div className="step-body">
        <Field label="Objectif principal" required error={errors.goal}>
          <div className="goal-grid">
            {OBJECTIFS.map((o) => {
              const Ic = Icon[o.icon];
              return (
                <button
                  type="button"
                  key={o.v}
                  className={`goal ${data.goal === o.v ? "is-selected" : ""}`}
                  onClick={() => set("goal", o.v)}
                >
                  <span className="goal-icon"><Ic width="18" height="18" /></span>
                  <span className="goal-title">{o.t}</span>
                  <span className="goal-radio">
                    <span className="goal-radio-dot" />
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Description de votre projet" required hint={`${data.project.length}/400`} error={errors.project}>
          <textarea
            className="input textarea"
            placeholder="Ex. Je dois livrer un dashboard de pilotage commercial pour la direction d'ici fin novembre, à partir de données Salesforce et Excel…"
            rows={4}
            maxLength={400}
            value={data.project}
            onChange={(e) => set("project", e.target.value)}
          />
        </Field>

        <Field label="Commentaires libres" hint="Optionnel — accessibilité, contraintes, questions…">
          <textarea
            className="input textarea"
            placeholder="Tout ce que vous voulez nous faire savoir."
            rows={3}
            value={data.comments}
            onChange={(e) => set("comments", e.target.value)}
          />
        </Field>

        <label className={`consent ${errors.consent ? "has-error" : ""}`}>
          <input type="checkbox" checked={data.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span className="consent-box">{data.consent && <Icon.check width="13" height="13" />}</span>
          <span className="consent-text">
            J'accepte que mes données soient utilisées pour traiter ma demande d'inscription, conformément à la <a href="#">charte RGPD</a>.
          </span>
        </label>
        {errors.consent && <div className="field-error">{errors.consent}</div>}
      </div>
    </div>
  );
}

/* ---------- SUCCESS ---------- */
function Success({ data, onReset }) {
  const ref = useMemo(() => `BST-${Math.floor(Math.random() * 9000 + 1000)}`, []);
  const niveau = NIVEAUX.find((n) => n.v === data.level)?.t || "—";
  const duree = DUREES.find((d) => d.v === data.duration);
  const objectif = OBJECTIFS.find((o) => o.v === data.goal)?.t || "—";
  const modulesLabels = data.modules.map((m) => MODULES.find((x) => x.v === m)?.t).filter(Boolean);
  const slotsLabels = data.slots.map((s) => CRENEAUX.find((x) => x.v === s)?.t).filter(Boolean);

  return (
    <div className="success">
      <div className="success-badge">
        <Icon.check width="36" height="36" />
      </div>
      <div className="success-eyebrow">DEMANDE ENVOYÉE · #{ref}</div>
      <h2 className="success-title">Merci {data.firstName}, votre boost est en préparation.</h2>
      <p className="success-sub">
        Un coach Boost Power BI examine votre profil et vous recontacte sous <strong>48h ouvrées</strong> à l'adresse <strong>{data.email}</strong> pour planifier l'entretien de cadrage.
      </p>

      <div className="success-profile">
        <div className="success-profile-head">
          <div className="success-profile-eyebrow">VOTRE PROFIL APPRENANT</div>
          <div className="success-profile-name">{data.firstName} {data.lastName} · <span className="muted">{data.role}</span></div>
        </div>
        <div className="success-profile-grid">
          <div className="sp-cell"><div className="sp-key">Niveau</div><div className="sp-val">{niveau}</div></div>
          <div className="sp-cell"><div className="sp-key">Durée</div><div className="sp-val">{duree ? `${duree.t} · ${duree.h}` : "—"}</div></div>
          <div className="sp-cell"><div className="sp-key">Objectif</div><div className="sp-val">{objectif}</div></div>
          <div className="sp-cell sp-cell-wide"><div className="sp-key">Modules</div><div className="sp-val">{modulesLabels.join(" · ") || "—"}</div></div>
          <div className="sp-cell sp-cell-wide"><div className="sp-key">Créneaux</div><div className="sp-val">{slotsLabels.join(" · ") || "—"}</div></div>
        </div>
      </div>

      <div className="success-cards">
        <div className="success-card">
          <div className="success-card-num">01</div>
          <div className="success-card-title">Entretien de cadrage</div>
          <div className="success-card-desc">30 min, en visio, pour valider le parcours.</div>
        </div>
        <div className="success-card">
          <div className="success-card-num">02</div>
          <div className="success-card-title">Plan personnalisé</div>
          <div className="success-card-desc">Modules adaptés à votre niveau et vos objectifs.</div>
        </div>
        <div className="success-card">
          <div className="success-card-num">03</div>
          <div className="success-card-title">Démarrage</div>
          <div className="success-card-desc">Accès à l'espace Boost et premiers exercices.</div>
        </div>
      </div>
      <button className="btn btn-ghost" onClick={onReset}>Soumettre une autre demande</button>
    </div>
  );
}

/* ---------- DECOR PANEL (left side, variant: split) ---------- */
function DecorPanel({ current, accent, data }) {
  const completion = Math.min(100, Math.round((current / STEPS.length) * 100));
  return (
    <aside className="decor">
      <div className="decor-top">
        <div className="brand">
          <img src="assets/logo-boost.png" alt="Boost Power BI" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-name">BOOST <span className="brand-name-accent">POWER BI</span></div>
            <div className="brand-tag">Espace de formation</div>
          </div>
        </div>

        <div className="decor-headline">
          <div className="decor-eyebrow">PROGRAMME · COHORTE 04</div>
          <h1 className="decor-title">
            Devenez<br />
            <span className="decor-title-accent">data-fluent</span><br />
            en 6 semaines.
          </h1>
        </div>
      </div>

      <div className="decor-cards">
        <div className="dcard dcard-stat">
          <div className="dcard-label">Taux de complétion</div>
          <div className="dcard-stat-row">
            <div className="dcard-stat-num">94<span className="dcard-stat-pct">%</span></div>
            <Donut pct={94} size={56} color={accent} track="rgba(255,255,255,0.12)" />
          </div>
          <div className="dcard-trend">
            <Sparkline values={[42, 55, 48, 67, 72, 81, 88, 94]} color={accent} fill={accent} w={140} h={28} />
            <span className="dcard-trend-label">8 dernières cohortes</span>
          </div>
        </div>

        <div className="dcard dcard-bars">
          <div className="dcard-label">Compétences acquises</div>
          <div className="dcard-bars-list">
            {[
              { k: "DAX", v: 92 },
              { k: "Modélisation", v: 86 },
              { k: "Power Query", v: 78 },
              { k: "Visualisation", v: 95 },
            ].map((b) => (
              <div key={b.k} className="bar-row">
                <span className="bar-row-key">{b.k}</span>
                <div className="bar-row-track">
                  <div className="bar-row-fill" style={{ width: `${b.v}%`, background: accent }} />
                </div>
                <span className="bar-row-val">{b.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dcard dcard-quote">
          <div className="dcard-quote-mark">"</div>
          <div className="dcard-quote-text">
            J'ai livré mon premier dashboard finance en 4 semaines. L'accompagnement fait toute la différence.
          </div>
          <div className="dcard-quote-author">
            <div className="dcard-avatar">M.L</div>
            <div>
              <div className="dcard-quote-name">Mathilde L.</div>
              <div className="dcard-quote-role">Contrôleuse de gestion</div>
            </div>
          </div>
        </div>
      </div>

      <div className="decor-footer">
        <div className="decor-progress">
          <div className="decor-progress-label">Votre progression</div>
          <div className="decor-progress-num">{completion}%</div>
        </div>
        <div className="decor-progress-track">
          <div className="decor-progress-fill" style={{ width: `${completion}%`, background: accent }} />
        </div>
      </div>
    </aside>
  );
}

/* ---------- VALIDATION ---------- */
function validateStep(step, data) {
  const e = {};
  if (step === 1) {
    if (!data.firstName.trim()) e.firstName = "Prénom requis";
    if (!data.lastName.trim()) e.lastName = "Nom requis";
    if (!data.email.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Email invalide";
    if (!data.company.trim()) e.company = "Organisation requise";
    if (!data.role.trim()) e.role = "Fonction requise";
  }
  if (step === 2) {
    if (!data.level) e.level = "Choisissez un niveau";
    if (data.modules.length === 0) e.modules = "Sélectionnez au moins un module";
  }
  if (step === 3) {
    if (data.slots.length === 0) e.slots = "Sélectionnez au moins un créneau";
    if (!data.duration) e.duration = "Choisissez une durée";
    if (!data.source) e.source = "Indiquez la source de découverte";
  }
  if (step === 4) {
    if (!data.goal) e.goal = "Choisissez un objectif principal";
    if (!data.project.trim()) e.project = "Décrivez brièvement votre projet";
    else if (data.project.trim().length < 20) e.project = "Au moins 20 caractères";
    if (!data.consent) e.consent = "Vous devez accepter la charte";
  }
  return e;
}

/* ---------- MAIN APP ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "midnight",
  "accent": "#F4B400",
  "progressStyle": "stepper",
  "showDecor": true,
  "density": "comfy"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const initial = {
    firstName: "", lastName: "", email: "", phone: "",
    company: "", role: "",
    level: "", modules: [],
    slots: [], duration: "", source: "",
    goal: "", project: "", comments: "", consent: false,
  };
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k, v) => setData((d) => {
    const arr = d[k];
    if (arr.includes(v)) return { ...d, [k]: arr.filter((x) => x !== v) };
    return { ...d, [k]: [...arr, v] };
  });

  const submitToSheet = async () => {
    const endpoint = window.BOOST_SHEETS_ENDPOINT;
    if (!endpoint || endpoint.includes("YOUR_DEPLOYMENT_ID")) {
      console.warn("[Boost] Aucun endpoint Apps Script configuré — envoi simulé.");
      return { ok: true, simulated: true };
    }
    const payload = {
      ...data,
      modules: data.modules.join(", "),
      slots: data.slots.join(", "),
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    try {
      // const res = await fetch(endpoint, {
      //   method: "POST",
      //   mode: "cors",
      //   headers: { "Content-Type": "text/plain;charset=utf-8" },
      //   body: JSON.stringify(payload),
      // });

      await fetch(window.BOOST_SHEETS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",                         // ← ajouter cette ligne
        credentials: "omit", 
        headers: { "Content-Type": "text/plain" }, // ← changer le Content-Type
        body: JSON.stringify(payload),
      });
      
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.ok === false) throw new Error(out.error || `HTTP ${res.status}`);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  };

  const next = async () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (Object.keys(e).length !== 0) return;
    if (step < STEPS.length) { setStep(step + 1); return; }
    setSubmitting(true); setSubmitError("");
    const result = await submitToSheet();
    setSubmitting(false);
    if (result.ok) setSubmitted(true);
    else setSubmitError("L'envoi vers Google Sheets a échoué. Réessayez ou contactez-nous.");
  };
  const back = () => { if (step > 1) setStep(step - 1); setErrors({}); };
  const reset = () => {
    setSubmitted(false); setStep(1); setErrors({}); setSubmitError("");
    setData(initial);
  };

  // accent CSS var
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  const themeClass = `theme-${t.theme} density-${t.density}`;

  return (
    <div className={`app ${themeClass}`}>
      {/* ambient grid */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-gradient" aria-hidden="true" />

      <div className={`shell ${t.showDecor ? "has-decor" : "no-decor"}`}>
        {t.showDecor && <DecorPanel current={step} accent={t.accent} data={data} />}

        <main className="form-pane">
          <div className="form-topbar">
            {!t.showDecor && (
              <div className="brand brand-inline">
                <img src="assets/logo-boost.png" alt="Boost Power BI" className="brand-logo" />
                <div className="brand-text">
                  <div className="brand-name">BOOST <span className="brand-name-accent">POWER BI</span></div>
                </div>
              </div>
            )}
            <div className="topbar-meta">
              <span className="topbar-meta-dot" />
              Inscription · Cohorte 04 · Démarrage 14 oct.
            </div>
          </div>

          {!submitted && (
            <div className="progress-zone">
              <ProgressStepper current={step} style={t.progressStyle} />
            </div>
          )}

          <div className="form-card">
            {submitted ? (
              <Success data={data} onReset={reset} />
            ) : (
              <>
                {step === 1 && <StepIdentity data={data} set={set} errors={errors} />}
                {step === 2 && <StepProfile data={data} set={set} toggle={toggle} errors={errors} />}
                {step === 3 && <StepAvailability data={data} set={set} toggle={toggle} errors={errors} />}
                {step === 4 && <StepGoals data={data} set={set} errors={errors} />}

                {submitError && (
                  <div className="submit-error">
                    <span className="submit-error-mark">!</span>
                    {submitError}
                  </div>
                )}
                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={back} disabled={step === 1 || submitting}>
                    <Icon.back width="16" height="16" /> Retour
                  </button>
                  <div className="form-actions-meta">
                    Étape {step} / {STEPS.length} · {STEPS[step - 1].hint}
                  </div>
                  <button className="btn btn-primary" onClick={next} disabled={submitting}>
                    {submitting ? "Envoi en cours…" : (step === STEPS.length ? "Envoyer ma demande" : "Continuer")}
                    {!submitting && <Icon.arrow width="16" height="16" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <footer className="form-footer">
            <span>© Boost Power BI 2026 · <a href="#">Charte RGPD</a> · <a href="#">CGU</a></span>
            <span className="form-footer-right">Besoin d'aide ? <a href="#">contact@boost-powerbi.fr</a></span>
          </footer>
        </main>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Thème">
          <TweakRadio
            label="Mode"
            value={t.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "midnight", label: "Midnight" },
              { value: "paper", label: "Paper" },
              { value: "neon", label: "Neon" },
            ]}
          />
          <TweakColor
            label="Accent"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#F4B400", "#FFC93C", "#B9DCF2", "#3A67AF"]}
          />
        </TweakSection>
        <TweakSection title="Mise en page">
          <TweakRadio
            label="Progression"
            value={t.progressStyle}
            onChange={(v) => setTweak("progressStyle", v)}
            options={[
              { value: "stepper", label: "Stepper" },
              { value: "bar", label: "Barre" },
            ]}
          />
          <TweakToggle label="Panneau décor" value={t.showDecor} onChange={(v) => setTweak("showDecor", v)} />
          <TweakRadio
            label="Densité"
            value={t.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "comfy", label: "Aéré" },
              { value: "tight", label: "Compact" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
