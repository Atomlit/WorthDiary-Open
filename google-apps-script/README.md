# Autonomous Google Apps Script Time-Lock Dead-Man's Switch

This directory contains the open-source reference implementation of the **Autonomous Time-Locked Password Dead-Man's Switch** used in [Worth Diary](https://www.worthdiary.com).

## Overview

Traditional digital legacy and emergency planning services store master passwords and emergency directives on their own company servers. If the service ceases operations, suffers a breach, or gets acquired, your family loses access or private keys are exposed.

Worth Diary solves this by utilizing **self-sovereign execution on Google Apps Script**:
- The script deploys **100% inside your own personal Google Account**.
- Atomlit Labs maintains **zero access** to your encryption keys, countdown timer, or emergency passwords.
- Trusted family members do **not** need to create an account, purchase a subscription, or download an application. They simply access the web portal URL hosted by Google.

---

## Security Architecture & Forward Secrecy

1. **Heartbeat Countdown Pulse**:
   - As long as you interact with Worth Diary or confirm a periodic check-in pulse, the client application issues an authenticated webhook request (`doPost`) that pushes the reveal date forward (e.g., +30, +60, or +90 days).
2. **Forward Secrecy & Dynamic Key Rotation**:
   - Each time your financial dossier updates or your vault re-syncs, a fresh random password and unique `VAULT_FILE_ID` are generated.
   - The script only ever reveals the decryption password matching the **active `VAULT_FILE_ID`**.
   - Older, superseded PDF copies that may have been downloaded previously can never be decrypted by the portal, preventing obsolete financial figures or removed directives from leaking.
3. **Emergency Release Trigger**:
   - If unforeseen circumstances prevent check-in pulses and the countdown reaches zero, the web portal automatically reveals the decryption password to authorized family members.
4. **Owner Override & Instant Wipe**:
   - The owner can instantly pause, deactivate, or wipe all active encryption keys via an authenticated webhook call (`action: "wipe"` or `action: "neutralize"`).

---

## Manual Deployment Walkthrough

To inspect or deploy this script manually inside your own Google Drive:

1. Open [Google Apps Script Home](https://script.google.com/home).
2. Click **New Project** and name it `Emergency Vault Time-Lock Portal`.
3. Replace `Code.gs` with the contents of [`timelock_script.template.gs`](./timelock_script.template.gs).
4. Add a new HTML file named `Index.html` and paste the contents of [`timelock_portal.template.html`](./timelock_portal.template.html).
5. Open **Project Settings (⚙️)** > **Script Properties** and add:
   - `UPDATE_SECRET`: A secure 32+ character random string.
   - `OWNER_NAME`: Your name.
   - `REVEAL_DATE_UTC`: ISO 8601 target release date (e.g. `2026-12-31T00:00:00.000Z`).
   - `VAULT_PASSWORD`: The AES-256 PDF encryption password.
   - `VAULT_FILE_ID`: Unique file identifier matching your PDF dossier.
6. Click **Deploy** > **New Deployment** > Select type: **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone** (allows recipients to view the countdown portal without authentication)
7. Save the resulting Web App URL.

---

## Webhook Endpoints

### 1. View / Fetch Status (`doGet`)
- **HTML UI**: `GET https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`
- **JSON Output**: `GET https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?format=json`

### 2. Update Heartbeat / Rotate Password (`doPost`)
```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_UPDATE_SECRET",
    "revealDateUtc": "2026-11-15T00:00:00.000Z",
    "password": "NEW_ROTATED_PASSWORD",
    "vaultFileId": "VAULT-2026-001"
  }'
```

### 3. Neutralize / Wipe Keys (`doPost`)
```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_UPDATE_SECRET",
    "action": "wipe"
  }'
```

---

## Official Links

- **Main Application**: [https://app.worthdiary.com](https://app.worthdiary.com)
- **Product Overview**: [https://www.worthdiary.com](https://www.worthdiary.com)
- **Technical Guides**: [https://www.worthdiary.com/blog/how-time-locked-passwords-work/](https://www.worthdiary.com/blog/how-time-locked-passwords-work/)
