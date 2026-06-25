"use client";

import { useId } from "react";
import {
  Country,
  Question,
  optionsForCountry,
} from "@/lib/questions";
import { CheckIcon } from "./icons";

// Une réponse peut être :
// - une chaîne (single, scale, text)
// - un tableau (multi)
// - { value, text } pour une option « Autre » avec saisie libre
export type AnswerValue =
  | string
  | string[]
  | { choice: string; text: string }
  | undefined;

interface Props {
  question: Question;
  country: Country;
  value: AnswerValue;
  otherText?: string;
  onChange: (value: AnswerValue) => void;
  onOtherTextChange?: (text: string) => void;
}

export default function QuestionField({
  question,
  country,
  value,
  otherText = "",
  onChange,
  onOtherTextChange,
}: Props) {
  const groupId = useId();
  const options = optionsForCountry(question, country);

  // ---------- SINGLE ----------
  if (question.type === "single") {
    return (
      <div role="radiogroup" aria-labelledby={groupId} className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <div key={opt.value} className="flex flex-col gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className="option"
                data-selected={selected}
                onClick={() => onChange(opt.value)}
              >
                <span className="marker marker-round" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>{opt.label}</span>
              </button>
              {opt.withText && selected && (
                <input
                  type="text"
                  className="field ml-9"
                  style={{ width: "calc(100% - 2.25rem)" }}
                  placeholder="Précisez…"
                  value={otherText}
                  onChange={(e) => onOtherTextChange?.(e.target.value)}
                  aria-label="Précisez votre réponse"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- MULTI ----------
  if (question.type === "multi") {
    const arr: string[] = Array.isArray(value) ? value : [];
    const max = question.maxSelect;
    const atMax = max ? arr.length >= max : false;

    const toggle = (v: string) => {
      if (arr.includes(v)) {
        onChange(arr.filter((x) => x !== v));
      } else {
        if (atMax) return; // limite atteinte
        onChange([...arr, v]);
      }
    };

    return (
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const selected = arr.includes(opt.value);
          const disabled = !selected && atMax;
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-disabled={disabled}
              className="option"
              data-selected={selected}
              style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              onClick={() => toggle(opt.value)}
            >
              <span className="marker marker-square" aria-hidden="true">
                <CheckIcon />
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ---------- SCALE 1–5 ----------
  if (question.type === "scale") {
    const [left, right] = question.scaleLabels ?? ["", ""];
    return (
      <div>
        <div className="flex gap-2 sm:gap-3" role="radiogroup" aria-labelledby={groupId}>
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = value === String(n);
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Note ${n} sur 5`}
                className="scale-btn"
                data-selected={selected}
                onClick={() => onChange(String(n))}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-[0.8rem]" style={{ color: "var(--ink-faint)" }}>
          <span>{left}</span>
          <span className="text-right">{right}</span>
        </div>
      </div>
    );
  }

  // ---------- TEXT ----------
  return (
    <textarea
      className="field"
      rows={4}
      placeholder={question.placeholder}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      aria-label={question.label}
    />
  );
}
