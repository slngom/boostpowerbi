# Intégration Google Sheets — Boost Power BI

Le formulaire d'inscription envoie chaque soumission dans un Google Sheet via Apps Script.

## Étapes de configuration (5 min)

### 1. Créer le Google Sheet
- Aller sur [sheets.new](https://sheets.new)
- Renommer en `Boost Power BI — Inscriptions`

### 2. Ouvrir Apps Script
- Dans le Sheet : **Extensions → Apps Script**
- Supprimer le code par défaut
- Copier-coller le contenu de **`google-apps-script.gs`** (dans ce projet)
- **Sauvegarder** (Ctrl+S) — nommer le projet `Boost Power BI Endpoint`

### 3. Déployer en application web
- Cliquer **Déployer → Nouveau déploiement**
- Icône engrenage → **Application Web**
- Renseigner :
  - Description : `Boost Power BI Inscriptions v1`
  - Exécuter en tant que : **Moi**
  - Qui a accès : **Tout le monde**
- **Déployer** → autoriser l'accès (Google demandera de valider les permissions)
- **Copier l'URL** qui se termine par `/exec`

### 4. Coller l'URL dans le formulaire
Ouvrir `Boost Power BI - Inscription.html` et remplacer la ligne :

```js
window.BOOST_SHEETS_ENDPOINT = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

par votre URL réelle.

### 5. Tester
- Remplir le formulaire et envoyer
- La nouvelle ligne apparaît dans l'onglet **Inscriptions** du Sheet

## Données envoyées

| Colonne | Source |
|---|---|
| Date envoi | timestamp ISO automatique |
| Prénom, Nom | étape 1 |
| Email, Téléphone | étape 1 |
| Organisation, Poste | étape 1 |
| Niveau | étape 2 |
| Modules | étape 2 (concaténés) |
| Créneaux | étape 3 (concaténés) |
| Durée | étape 3 |
| Source découverte | étape 3 |
| Objectif | étape 4 |
| Description projet | étape 4 |
| Commentaires | étape 4 |
| Consentement RGPD | étape 4 (Oui/Non) |
| User Agent | navigateur de l'utilisateur |

## Notification email (optionnel)

Dans `google-apps-script.gs`, décommenter le bloc `MailApp.sendEmail` et la fonction `buildEmailBody_` puis adapter l'adresse de destination.

## Mise à jour du code Apps Script

Si vous modifiez `google-apps-script.gs` :
- Recoller dans Apps Script
- **Déployer → Gérer les déploiements → ✏️ → Nouvelle version → Déployer**
- L'URL `/exec` reste la même

## Sécurité

- L'URL Apps Script est publique (nécessaire pour les soumissions anonymes)
- Le script accepte uniquement des requêtes POST avec un JSON valide
- Le consentement RGPD est obligatoire côté formulaire
- Pour ajouter une protection anti-spam, utiliser un honeypot ou hCaptcha

## Mode dégradé

Si l'URL n'est pas configurée (`YOUR_DEPLOYMENT_ID` toujours présent), le formulaire affiche tout de même l'écran de confirmation — un avertissement est loggé en console. Utile pour tester l'UI avant déploiement.
