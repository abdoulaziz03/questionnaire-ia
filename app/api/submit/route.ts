import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Réception d'une réponse au questionnaire.
//
// Stockage : si la variable d'environnement SHEETS_WEBHOOK_URL est définie
// (URL d'un script Google Apps Script — voir google-apps-script.gs), la réponse
// y est transférée pour être ajoutée à une feuille de calcul. Sinon, la réponse
// est seulement journalisée côté serveur (utile en développement local).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const webhook = process.env.SHEETS_WEBHOOK_URL;

  if (!webhook) {
    // Aucun stockage configuré : on journalise pour ne pas perdre la réponse en dev.
    console.log("[questionnaire] Réponse reçue (aucun SHEETS_WEBHOOK_URL configuré) :", JSON.stringify(body));
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[questionnaire] Erreur webhook :", res.status, text);
      return NextResponse.json({ ok: false, error: "Échec de l'enregistrement" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[questionnaire] Exception webhook :", err);
    return NextResponse.json({ ok: false, error: "Service de stockage injoignable" }, { status: 502 });
  }
}
