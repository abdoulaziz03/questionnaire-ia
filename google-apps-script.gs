/**
 * Collecte des réponses du questionnaire dans une feuille Google Sheets.
 *
 * INSTALLATION (gratuit, sans base de données) :
 *  1. Créez une feuille de calcul sur https://sheets.google.com
 *  2. Menu  Extensions > Apps Script
 *  3. Collez ce code, remplaçant tout le contenu existant
 *  4. Cliquez sur  Déployer > Nouveau déploiement
 *       - Type : « Application Web »
 *       - Exécuter en tant que : Moi
 *       - Qui a accès : « Tout le monde »
 *  5. Copiez l'URL de l'application web (se termine par /exec)
 *  6. Dans Vercel : Settings > Environment Variables
 *       Nom    : SHEETS_WEBHOOK_URL
 *       Valeur : l'URL copiée
 *     puis redéployez le projet.
 *
 * Chaque réponse crée une nouvelle ligne. Les colonnes (questions) sont
 * créées automatiquement et se complètent selon les questions répondues
 * (France ou Côte d'Ivoire).
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // évite les écritures simultanées
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Aplatissement : métadonnées + chaque réponse de question.
    const flat = {
      horodatage: new Date(),
      pays: data.country || "",
      duree_sec: data.durationSec || "",
      debut: data.startedAt || "",
      fin: data.submittedAt || "",
    };
    const answers = data.answers || {};
    Object.keys(answers).forEach(function (k) {
      flat[k] = answers[k];
    });

    // En-têtes : créés à la première réponse, complétés ensuite si besoin.
    let headers = [];
    if (sheet.getLastRow() === 0) {
      headers = Object.keys(flat);
      sheet.appendRow(headers);
    } else {
      headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0]
        .filter(String);
      // Ajoute les nouvelles colonnes éventuelles (ex. questions de l'autre pays).
      Object.keys(flat).forEach(function (key) {
        if (headers.indexOf(key) === -1) {
          headers.push(key);
          sheet.getRange(1, headers.length).setValue(key);
        }
      });
    }

    const row = headers.map(function (h) {
      return flat[h] !== undefined ? flat[h] : "";
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
