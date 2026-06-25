"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Country,
  PARTS,
  Question,
  optionsForCountry,
  questionsForCountry,
} from "@/lib/questions";
import QuestionField, { AnswerValue } from "./QuestionField";
import { ArrowLeft, ArrowRight } from "./icons";

type Phase = "intro" | "survey" | "submitting" | "done" | "error";

interface AnswersState {
  [questionId: string]: AnswerValue;
}

export default function Survey() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [country, setCountry] = useState<Country | null>(null);
  const [partIndex, setPartIndex] = useState(0); // index dans PARTS (0 → Partie 1)
  const [answers, setAnswers] = useState<AnswersState>({});
  const [otherText, setOtherText] = useState(""); // texte « Autre » de la Q1
  const [showErrors, setShowErrors] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const topRef = useRef<HTMLDivElement>(null);

  // Teinte l'interface selon le pays choisi (élément signature).
  useEffect(() => {
    if (country) document.body.setAttribute("data-country", country);
    else document.body.removeAttribute("data-country");
  }, [country]);

  const visibleQuestions: Question[] = useMemo(
    () => (country ? questionsForCountry(country) : []),
    [country]
  );

  const currentPart = PARTS[partIndex];
  const partQuestions = useMemo(
    () => visibleQuestions.filter((q) => q.part === currentPart?.number),
    [visibleQuestions, currentPart]
  );

  // Progression : part des questions répondues sur l'ensemble visible.
  const answeredCount = useMemo(
    () => visibleQuestions.filter((q) => isAnswered(q, answers[q.id], otherText)).length,
    [visibleQuestions, answers, otherText]
  );
  const progress = visibleQuestions.length
    ? Math.round((answeredCount / visibleQuestions.length) * 100)
    : 0;

  const partComplete = partQuestions.every((q) =>
    !q.required ? true : isAnswered(q, answers[q.id], otherText)
  );

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start(c: Country) {
    setCountry(c);
    setPhase("survey");
    setPartIndex(0);
    startedAt.current = Date.now();
    setTimeout(scrollTop, 50);
  }

  function next() {
    if (!partComplete) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (partIndex < PARTS.length - 1) {
      setPartIndex((i) => i + 1);
      setTimeout(scrollTop, 50);
    } else {
      submit();
    }
  }

  function back() {
    setShowErrors(false);
    if (partIndex === 0) {
      setPhase("intro");
      setCountry(null);
    } else {
      setPartIndex((i) => i - 1);
    }
    setTimeout(scrollTop, 50);
  }

  async function submit() {
    if (!country) return;
    setPhase("submitting");
    const payload = {
      country,
      startedAt: new Date(startedAt.current).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      answers: flattenAnswers(country, answers, otherText),
    };
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Réponse serveur invalide");
      setPhase("done");
      setTimeout(scrollTop, 50);
    } catch {
      setPhase("error");
    }
  }

  // ---------------- Écran d'accueil + choix du pays ----------------
  if (phase === "intro") {
    return (
      <Shell topRef={topRef}>
        <div className="fade-in">
          <span className="eyebrow">Mémoire de Bachelor · Banque Assurance</span>
          <h1 className="font-display mt-4 text-[2rem] leading-[1.12] sm:text-[2.7rem]" style={{ fontWeight: 500 }}>
            L'intelligence artificielle comme outil structurant de la relation client en assurance
          </h1>
          <p className="mt-4 max-w-xl text-[1.05rem]" style={{ color: "var(--ink-soft)" }}>
            Enquête comparative <strong style={{ color: "var(--ink)" }}>France – Côte d'Ivoire</strong>. Questionnaire
            anonyme, environ 8 minutes. Aucune donnée personnelle n'est collectée.
          </p>

          <div className="mt-9">
            <p className="mb-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
              Pour commencer, indiquez où vous résidez :
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <CountryCard
                flag="🇫🇷"
                title="France"
                subtitle="Marché numérique mature"
                onClick={() => start("FR")}
              />
              <CountryCard
                flag="🇨🇮"
                title="Côte d'Ivoire"
                subtitle="Marché émergent"
                onClick={() => start("CIV")}
              />
            </div>
            <p className="mt-4 text-xs" style={{ color: "var(--ink-faint)" }}>
              Certaines questions sont spécifiques à votre pays ; elles s'adaptent automatiquement à votre choix.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // ---------------- Envoi en cours ----------------
  if (phase === "submitting") {
    return (
      <Shell topRef={topRef}>
        <div className="fade-in flex flex-col items-center py-16 text-center">
          <div className="spinner" aria-hidden="true" />
          <p className="mt-5" style={{ color: "var(--ink-soft)" }}>
            Enregistrement de vos réponses…
          </p>
        </div>
      </Shell>
    );
  }

  // ---------------- Merci ----------------
  if (phase === "done") {
    return (
      <Shell topRef={topRef}>
        <div className="fade-in py-10 text-center">
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-full"
            style={{ background: "var(--accent-soft)" }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display mt-6 text-[1.8rem]" style={{ fontWeight: 500 }}>
            Merci pour votre participation !
          </h2>
          <p className="mx-auto mt-3 max-w-md" style={{ color: "var(--ink-soft)" }}>
            Vos réponses ont bien été enregistrées. Ce questionnaire est strictement anonyme — aucune donnée
            personnelle n'a été collectée.
          </p>
        </div>
      </Shell>
    );
  }

  // ---------------- Erreur ----------------
  if (phase === "error") {
    return (
      <Shell topRef={topRef}>
        <div className="fade-in py-10 text-center">
          <h2 className="font-display text-[1.6rem]" style={{ fontWeight: 500 }}>
            L'envoi n'a pas abouti
          </h2>
          <p className="mx-auto mt-3 max-w-md" style={{ color: "var(--ink-soft)" }}>
            Vos réponses sont toujours là. Vérifiez votre connexion, puis réessayez.
          </p>
          <button className="btn-primary mt-6" onClick={submit}>
            Réessayer l'envoi
          </button>
        </div>
      </Shell>
    );
  }

  // ---------------- Questionnaire ----------------
  return (
    <Shell topRef={topRef}>
      {/* En-tête de progression */}
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="eyebrow">
            Partie {currentPart.number} sur {PARTS.length}
          </span>
          <span style={{ color: "var(--ink-faint)" }}>{progress}%</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <h2 className="font-display mt-4 text-[1.5rem] sm:text-[1.7rem]" style={{ fontWeight: 500 }}>
          {currentPart.title}
        </h2>
      </div>

      {/* Questions de la partie */}
      <div key={partIndex} className="fade-in flex flex-col gap-7">
        {partQuestions.map((q) => {
          const missing = showErrors && q.required && !isAnswered(q, answers[q.id], otherText);
          return (
            <fieldset key={q.id} className="card p-5 sm:p-6" style={missing ? { borderColor: "#d98b8b" } : undefined}>
              <legend className="contents">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-display text-sm" style={{ color: "var(--accent)", fontWeight: 600 }}>
                    {q.display}
                  </span>
                  {q.required && (
                    <span className="text-[0.7rem]" style={{ color: "var(--ink-faint)" }}>
                      obligatoire
                    </span>
                  )}
                </div>
                <p className="mb-1 text-[1.08rem] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
                  {q.label}
                </p>
              </legend>
              {q.help && (
                <p className="mb-3 text-sm" style={{ color: "var(--ink-faint)" }}>
                  {q.help}
                </p>
              )}
              {!q.help && <div className="mb-3" />}
              <QuestionField
                question={q}
                country={country as Country}
                value={answers[q.id]}
                otherText={otherText}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                onOtherTextChange={setOtherText}
              />
              {missing && (
                <p className="mt-3 text-sm" style={{ color: "#c0564f" }}>
                  Merci de répondre à cette question pour continuer.
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={back}>
          <ArrowLeft />
          {partIndex === 0 ? "Pays" : "Précédent"}
        </button>
        <button className="btn-primary" onClick={next}>
          {partIndex === PARTS.length - 1 ? "Envoyer mes réponses" : "Continuer"}
          {partIndex !== PARTS.length - 1 && <ArrowRight />}
        </button>
      </div>
    </Shell>
  );
}

/* ---------------- Sous-composants ---------------- */

function Shell({
  children,
  topRef,
}: {
  children: React.ReactNode;
  topRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <div ref={topRef} />
      <header className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--ink-faint)" }}>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />
        <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>Enquête IA &amp; Assurance</span>
      </header>
      {children}
      <footer className="mt-12 border-t pt-5 text-xs" style={{ borderColor: "var(--line)", color: "var(--ink-faint)" }}>
        Questionnaire strictement anonyme · Aucune donnée personnelle collectée · Usage strictement académique.
      </footer>
    </main>
  );
}

function CountryCard({
  flag,
  title,
  subtitle,
  onClick,
}: {
  flag: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="option" onClick={onClick} style={{ padding: "1.15rem 1.2rem" }}>
      <span style={{ fontSize: "1.7rem", lineHeight: 1 }} aria-hidden="true">
        {flag}
      </span>
      <span className="flex flex-col">
        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{title}</span>
        <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
          {subtitle}
        </span>
      </span>
    </button>
  );
}

/* ---------------- Logique ---------------- */

function isAnswered(q: Question, v: AnswerValue, otherText: string): boolean {
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  if (q.type === "text") return true; // facultatif
  if (q.type === "single") {
    if (typeof v !== "string" || v === "") return false;
    // Si « Autre » est choisi, exiger une précision.
    const opt = q.options?.find((o) => o.value === v);
    if (opt?.withText && otherText.trim() === "") return false;
    return true;
  }
  if (q.type === "scale") return typeof v === "string" && v !== "";
  return false;
}

// Transforme l'état en un objet plat lisible (un champ par question),
// idéal pour une ligne de feuille de calcul.
function flattenAnswers(
  country: Country,
  answers: AnswersState,
  otherText: string
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of questionsForCountry(country)) {
    const v = answers[q.id];
    const opts = optionsForCountry(q, country);
    if (q.type === "multi") {
      const arr = Array.isArray(v) ? v : [];
      out[q.id] = arr
        .map((val) => opts.find((o) => o.value === val)?.label ?? val)
        .join(" | ");
    } else if (q.type === "single") {
      const opt = opts.find((o) => o.value === v);
      let label = opt?.label ?? (typeof v === "string" ? v : "");
      if (opt?.withText && otherText.trim()) label = `${label} : ${otherText.trim()}`;
      out[q.id] = label;
    } else if (q.type === "scale") {
      out[q.id] = typeof v === "string" ? v : "";
    } else {
      out[q.id] = typeof v === "string" ? v : "";
    }
  }
  return out;
}
