/**
 * Boost Power BI — Apps Script endpoint
 *
 * Déploiement :
 *   1. Créer un Google Sheet (ex. "Boost Power BI - Inscriptions")
 *   2. Extensions > Apps Script
 *   3. Coller ce code, sauvegarder
 *   4. Déployer > Nouveau déploiement
 *      - Type : Application Web
 *      - Description : Boost Power BI Inscriptions
 *      - Exécuter en tant que : Moi
 *      - Qui a accès : Tout le monde
 *   5. Autoriser puis copier l'URL "/exec"
 *   6. La coller dans `Boost Power BI - Inscription.html` à la ligne
 *      `window.BOOST_SHEETS_ENDPOINT = "..."`
 *
 * Configuration des emails :
 *   - SEND_CONFIRMATION_TO_USER : true pour envoyer un email à l'inscrit
 *   - SEND_NOTIFICATION_TO_ADMIN : true pour notifier l'équipe coach
 *   - ADMIN_EMAIL : adresse de notification interne
 *   - FROM_NAME : nom d'expéditeur affiché
 */

const SHEET_NAME = 'Inscriptions';

const SEND_CONFIRMATION_TO_USER = true;
const SEND_NOTIFICATION_TO_ADMIN = true;
const ADMIN_EMAIL = 'contact@boost-powerbi.fr';
const FROM_NAME = 'Boost Power BI';
const REPLY_TO = 'contact@boost-powerbi.fr';

// Mot de passe pour l'API admin (lecture/maj statut). Changez-le !
const ADMIN_API_TOKEN = 'boost-admin-2026-changeme';

const HEADERS = [
  'Date envoi',
  'Prénom',
  'Nom',
  'Email',
  'Téléphone',
  'Organisation',
  'Poste',
  'Niveau',
  'Modules',
  'Créneaux',
  'Durée',
  'Source découverte',
  'Objectif',
  'Description projet',
  'Commentaires',
  'Consentement RGPD',
  'User Agent',
  'Email confirmation',
  'Statut',
  'Notes coach'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // Action admin : mise à jour statut/notes
    if (body.action === 'updateStatus') {
      if (body.token !== ADMIN_API_TOKEN) {
        return jsonOut_({ ok: false, error: 'unauthorized' });
      }
      return updateStatus_(body);
    }

    const sheet = getOrCreateSheet_();

    let confirmationStatus = '—';

    // Envoi des emails
    if (SEND_CONFIRMATION_TO_USER && body.email) {
      try {
        sendConfirmationEmail_(body);
        confirmationStatus = 'envoyé';
      } catch (mailErr) {
        confirmationStatus = 'échec: ' + String(mailErr).slice(0, 80);
      }
    }

    if (SEND_NOTIFICATION_TO_ADMIN && ADMIN_EMAIL) {
      try {
        sendAdminNotification_(body);
      } catch (mailErr) {
        // silencieux : ne bloque pas l'enregistrement
      }
    }

    const row = [
      body.submittedAt || new Date().toISOString(),
      body.firstName || '',
      body.lastName || '',
      body.email || '',
      body.phone || '',
      body.company || '',
      body.role || '',
      body.level || '',
      body.modules || '',
      body.slots || '',
      body.duration || '',
      body.source || '',
      body.goal || '',
      body.project || '',
      body.comments || '',
      body.consent ? 'Oui' : 'Non',
      body.userAgent || '',
      confirmationStatus,
      'En attente',
      ''
    ];

    sheet.appendRow(row);

    return jsonOut_({ ok: true, confirmation: confirmationStatus });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};

  // API admin : liste des inscriptions
  if (params.action === 'list') {
    if (params.token !== ADMIN_API_TOKEN) {
      return jsonOut_({ ok: false, error: 'unauthorized' });
    }
    return listInscriptions_();
  }

  return jsonOut_({ ok: true, service: 'Boost Power BI Inscriptions' });
}

function listInscriptions_() {
  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return jsonOut_({ ok: true, items: [] });

  const headers = values[0];
  const items = values.slice(1).map((row, idx) => {
    const obj = { rowIndex: idx + 2 }; // 1-based + header
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return jsonOut_({ ok: true, items: items });
}

function updateStatus_(body) {
  const sheet = getOrCreateSheet_();
  const rowIndex = parseInt(body.rowIndex, 10);
  if (!rowIndex || rowIndex < 2) {
    return jsonOut_({ ok: false, error: 'invalid rowIndex' });
  }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusCol = headers.indexOf('Statut') + 1;
  const notesCol = headers.indexOf('Notes coach') + 1;

  if (body.status && statusCol > 0) {
    sheet.getRange(rowIndex, statusCol).setValue(body.status);
  }
  if (typeof body.notes === 'string' && notesCol > 0) {
    sheet.getRange(rowIndex, notesCol).setValue(body.notes);
  }
  return jsonOut_({ ok: true });
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1A4A9E')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ========================================================================
 *  EMAILS
 * ======================================================================== */

function sendConfirmationEmail_(b) {
  const subject = 'Votre demande d\'inscription Boost Power BI · bien reçue';
  const htmlBody = buildUserEmailHtml_(b);
  const textBody = buildUserEmailText_(b);

  MailApp.sendEmail({
    to: b.email,
    subject: subject,
    body: textBody,
    htmlBody: htmlBody,
    name: FROM_NAME,
    replyTo: REPLY_TO
  });
}

function sendAdminNotification_(b) {
  const subject = `Nouvelle inscription · ${b.firstName || ''} ${b.lastName || ''}`.trim();
  const htmlBody = buildAdminEmailHtml_(b);

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: FROM_NAME,
    replyTo: b.email || REPLY_TO
  });
}

function buildUserEmailHtml_(b) {
  const firstName = escapeHtml_(b.firstName || '');
  const modulesList = (b.modules || '').split(',').map(m => m.trim()).filter(Boolean);
  const modulesHtml = modulesList.length
    ? '<ul style="margin: 0; padding-left: 20px; color: #243857;">' +
      modulesList.map(m => '<li style="margin-bottom: 4px;">' + escapeHtml_(m) + '</li>').join('') +
      '</ul>'
    : '<em style="color: #6E7C99;">à définir avec votre coach</em>';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Inscription Boost Power BI</title>
</head>
<body style="margin: 0; padding: 0; background: #F4F6FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #243857;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F4F6FA; padding: 32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(20, 50, 112, 0.08);">

        <!-- Header -->
        <tr>
          <td style="background: #0E2654; padding: 36px 40px; color: #FFFFFF;">
            <div style="font-family: 'Space Grotesk', -apple-system, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
              BOOST <span style="color: #F4B400;">POWER BI</span>
            </div>
            <div style="font-size: 12px; color: #B9DCF2; margin-top: 4px;">Espace de formation</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 44px 40px 16px;">
            <div style="display: inline-block; padding: 6px 12px; background: #FFF8E1; color: #8A6300; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 100px; margin-bottom: 24px;">
              ✓ Demande reçue
            </div>
            <h1 style="font-family: 'Space Grotesk', -apple-system, sans-serif; font-size: 32px; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em; color: #0E2654; margin: 0 0 18px;">
              Merci ${firstName},<br>votre dossier est entre nos mains.
            </h1>
            <p style="font-size: 15px; line-height: 1.6; color: #4A5878; margin: 0 0 16px;">
              Nous avons bien reçu votre demande d'inscription au programme Boost Power BI. Un coach va l'étudier et vous recontacter <strong style="color: #0E2654;">sous 48h ouvrées</strong> pour planifier votre entretien de cadrage.
            </p>
          </td>
        </tr>

        <!-- Récap -->
        <tr>
          <td style="padding: 8px 40px 16px;">
            <div style="background: #F4F6FA; border-radius: 12px; padding: 22px 24px; border-left: 3px solid #F4B400;">
              <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #6E7C99; margin-bottom: 14px;">
                Récapitulatif de votre demande
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #243857;">
                <tr><td style="padding: 4px 0; color: #6E7C99; width: 38%;">Niveau</td><td style="padding: 4px 0; font-weight: 600;">${escapeHtml_(b.level || '—')}</td></tr>
                <tr><td style="padding: 4px 0; color: #6E7C99;">Durée souhaitée</td><td style="padding: 4px 0; font-weight: 600;">${escapeHtml_(b.duration || '—')}</td></tr>
                <tr><td style="padding: 4px 0; color: #6E7C99;">Disponibilités</td><td style="padding: 4px 0; font-weight: 600;">${escapeHtml_(b.slots || '—')}</td></tr>
                <tr><td style="padding: 8px 0 4px; color: #6E7C99; vertical-align: top;">Modules</td><td style="padding: 8px 0 4px;">${modulesHtml}</td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Étapes -->
        <tr>
          <td style="padding: 24px 40px 8px;">
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #F4B400; font-weight: 600; margin-bottom: 16px;">
              Les prochaines étapes
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 8px 0; vertical-align: top; width: 36px;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #F4B400; color: #0E2654; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">1</div>
                </td>
                <td style="padding: 8px 0 8px 12px; font-size: 14px; line-height: 1.5; color: #243857;">
                  <strong>Étude de votre dossier</strong><br>
                  <span style="color: #6E7C99;">Un coach analyse votre profil et votre projet (24 à 48h ouvrées).</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #F4B400; color: #0E2654; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">2</div>
                </td>
                <td style="padding: 8px 0 8px 12px; font-size: 14px; line-height: 1.5; color: #243857;">
                  <strong>Entretien de cadrage</strong><br>
                  <span style="color: #6E7C99;">30 minutes en visio pour valider votre parcours et le démarrage.</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #F4B400; color: #0E2654; font-weight: 700; font-size: 13px; text-align: center; line-height: 28px;">3</div>
                </td>
                <td style="padding: 8px 0 8px 12px; font-size: 14px; line-height: 1.5; color: #243857;">
                  <strong>Lancement du programme</strong><br>
                  <span style="color: #6E7C99;">Accès à la plateforme, premier atelier, et c'est parti.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding: 28px 40px 36px; border-top: 1px solid #E5E9F2; margin-top: 20px;">
            <p style="font-size: 14px; line-height: 1.6; color: #4A5878; margin: 0 0 6px;">
              Une question d'ici là ? Répondez simplement à cet email — nous lisons toutes les réponses.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #243857; margin: 14px 0 0;">
              <strong>L'équipe Boost Power BI</strong>
            </p>
          </td>
        </tr>

      </table>

      <!-- Footer -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 16px;">
        <tr>
          <td style="text-align: center; font-size: 11px; color: #8A95B0; padding: 8px 24px; line-height: 1.5;">
            © Boost Power BI — Cet email vous a été envoyé suite à votre demande d'inscription.<br>
            Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildUserEmailText_(b) {
  return [
    `Bonjour ${b.firstName || ''},`,
    '',
    'Nous avons bien reçu votre demande d\'inscription au programme Boost Power BI.',
    'Un coach étudie votre dossier et vous recontactera sous 48h ouvrées.',
    '',
    'RÉCAPITULATIF',
    `· Niveau : ${b.level || '—'}`,
    `· Durée : ${b.duration || '—'}`,
    `· Disponibilités : ${b.slots || '—'}`,
    `· Modules : ${b.modules || '—'}`,
    '',
    'PROCHAINES ÉTAPES',
    '1. Étude de votre dossier (24-48h ouvrées)',
    '2. Entretien de cadrage en visio (30 min)',
    '3. Lancement du programme',
    '',
    'Une question ? Répondez simplement à cet email.',
    '',
    'L\'équipe Boost Power BI'
  ].join('\n');
}

function buildAdminEmailHtml_(b) {
  return `<!doctype html>
<html lang="fr"><body style="font-family: -apple-system, sans-serif; color: #243857; padding: 24px; max-width: 640px;">
  <div style="background: #0E2654; color: #FFFFFF; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 12px; color: #F4B400; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700;">Nouvelle inscription</div>
    <div style="font-size: 20px; font-weight: 600; margin-top: 4px;">${escapeHtml_(b.firstName || '')} ${escapeHtml_(b.lastName || '')}</div>
  </div>
  <div style="background: #F4F6FA; padding: 20px; border-radius: 0 0 8px 8px;">
    <table cellpadding="6" cellspacing="0" style="font-size: 14px; width: 100%;">
      <tr><td style="color: #6E7C99; width: 35%;">Email</td><td><a href="mailto:${escapeHtml_(b.email || '')}">${escapeHtml_(b.email || '—')}</a></td></tr>
      <tr><td style="color: #6E7C99;">Téléphone</td><td>${escapeHtml_(b.phone || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Organisation</td><td>${escapeHtml_(b.company || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Poste</td><td>${escapeHtml_(b.role || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Niveau</td><td><strong>${escapeHtml_(b.level || '—')}</strong></td></tr>
      <tr><td style="color: #6E7C99;">Durée</td><td>${escapeHtml_(b.duration || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Modules</td><td>${escapeHtml_(b.modules || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Créneaux</td><td>${escapeHtml_(b.slots || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Objectif</td><td>${escapeHtml_(b.goal || '—')}</td></tr>
      <tr><td style="color: #6E7C99;">Source</td><td>${escapeHtml_(b.source || '—')}</td></tr>
    </table>
    ${b.project ? `<div style="margin-top: 16px; padding: 12px; background: #FFFFFF; border-radius: 6px; border-left: 3px solid #F4B400;"><div style="font-size: 11px; color: #6E7C99; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Description projet</div><div style="font-size: 14px; line-height: 1.5;">${escapeHtml_(b.project).replace(/\n/g, '<br>')}</div></div>` : ''}
    ${b.comments ? `<div style="margin-top: 12px; padding: 12px; background: #FFFFFF; border-radius: 6px; border-left: 3px solid #B9DCF2;"><div style="font-size: 11px; color: #6E7C99; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Commentaires</div><div style="font-size: 14px; line-height: 1.5;">${escapeHtml_(b.comments).replace(/\n/g, '<br>')}</div></div>` : ''}
  </div>
</body></html>`;
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
