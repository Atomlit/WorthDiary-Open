# Data Safety, Durability & Zero Data Loss Guarantee

## Core Architectural Proof: Why Local-First Does Not Mean Data Loss

A frequent misconception about "local-first" software is:
> *"Because records are stored locally, losing browser data or a device without a valid backup could be a problem."*

In [Worth Diary](https://www.worthdiary.com), this concern is **factually false**.

---

## 1. Dual-Layer Storage: Local Speed + Cloud Redundancy

Worth Diary uses a hybrid storage pipeline that combines:
1. **Local Speed & Offline Resilience**: IndexedDB provides instant page loads and offline viewing with zero network latency.
2. **Automated Cloud Backup**: The application continuously synchronizes encrypted state to the user's personal Google Drive hidden application folder (`drive.appdata`).

```
+-------------------------------------------------------------+
|                     Client Device (Browser/PWA)             |
|                                                             |
|  [ User Interface ] <---> [ IndexedDB Local Cache ]         |
|                                  |                          |
|                       Client-Side AES-256-GCM                |
+----------------------------------|--------------------------+
                                   |
                Encrypted Snapshot Auto-Sync
                                   |
                                   v
+-------------------------------------------------------------+
|                 User's Personal Google Drive                |
|                                                             |
|  [ drive.appdata Hidden Folder ]                            |
|    ├── Automerge Encrypted State Snapshot                   |
|    ├── Encrypted Time-Locked PDF Dossiers                   |
|    └── Autonomous Dead-Man's Switch Webhook                 |
+-------------------------------------------------------------+
```

---

## 2. Recovery Scenarios

| Scenario | What Happens | Recovery Action | Data Loss? |
| :--- | :--- | :--- | :--- |
| **User clears browser cookies & cache** | IndexedDB is wiped clean on the local device. | Open `app.worthdiary.com` and sign in with Google. The vault restores in ~2 seconds. | **ZERO** |
| **Laptop is lost, stolen, or damaged** | Local device is unavailable. | Open `app.worthdiary.com` on any new computer or phone, sign in with Google. Entire vault is restored. | **ZERO** |
| **User switches between phone and laptop** | Each device holds a local cache. | Changes sync automatically via Google Drive. | **ZERO** |
| **Offline use (airplane mode)** | Changes are stored locally in IndexedDB. | As soon as internet is restored, changes automatically commit to Google Drive. | **ZERO** |
| **Atomlit Labs server outage** | Marketing site or billing APIs temporarily offline. | App runs client-side and communicates directly with Google Drive APIs. Full offline and cloud operation continues uninterrupted. | **ZERO** |

---

## 3. Comparison with Alternative Financial Tools

| Feature | Worth Diary | DIY Spreadsheets | Traditional Cloud FinTech |
| :--- | :--- | :--- | :--- |
| **Data Loss on Cache Clear** | ❌ **No loss** (Backed up to Google Drive) | ❌ No loss | ❌ No loss |
| **Private to User Only** | ✅ **100% Private** | ⚠️ Unencrypted on Drive | ❌ Stored in company database |
| **Bank Password Scraping** | ❌ **Never** (Zero credential linking) | ❌ Never | ⚠️ Required via Plaid/Yodlee |
| **Autonomous Dead-Man's Switch** | ✅ **Built-in Google Apps Script** | ❌ None | ❌ None |
| **Emergency PDF Binder** | ✅ **Auto-generated AES-256 PDF** | ❌ Manual formatting | ❌ None |
