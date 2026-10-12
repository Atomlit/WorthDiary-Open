# Technical Architecture: Local-First & Sovereign Cloud Storage

## Executive Summary

[Worth Diary](https://www.worthdiary.com) is built on a **Bring-Your-Own-Storage (BYOS)** architecture. Rather than storing sensitive financial balances, account numbers, and family estate directives in a centralized multi-tenant database, all data is encrypted on the client device and stored in the user's private Google Drive (`appDataFolder`).

---

## 1. Zero Company Databases Philosophy

Traditional FinTech applications store user net worth and transaction history in centralized cloud databases (PostgreSQL, MongoDB) managed by the company. This creates three critical vulnerabilities:
1. **Target for Data Breaches**: Centralized databases containing thousands of net worth portfolios attract malicious hackers.
2. **Third-Party Monetization**: Companies face economic incentives to monetize financial records through credit card offers, insurance pitches, or data broker sales.
3. **Vendor Lock-In**: If the vendor discontinues service or raises prices, users can be locked out of their records.

**The Worth Diary Model**:
- **0 Central Databases**: Atomlit Labs operates zero databases containing user financial records, balances, or directives.
- **Client-Side Cryptography**: Encryption and decryption happen in the browser using the W3C Web Cryptography API (`AES-GCM-256`).
- **Data Sovereignty**: The user owns 100% of their data in their personal Google account.

---

## 2. Google Drive OAuth Scopes & Strict Isolation

Worth Diary requests only minimal, sandboxed OAuth 2.0 scopes from Google:

| OAuth Scope | Purpose | Isolation Guarantee |
| :--- | :--- | :--- |
| `drive.appdata` | Stores encrypted sync state and document snapshots | Hidden application folder. Cannot read, list, or access personal files, photos, or documents on Google Drive. |
| `drive.file` | Creates exported Emergency PDF binders and shared emergency dossiers | Can only access files and folders directly created by Worth Diary. |
| `calendar.app.created` | Adds periodic review invites | Restricted to a dedicated secondary calendar (*"Worth Diary - Reminders"*). Cannot read personal or work calendar events. |
| `script.projects` / `script.deployments` *(Optional)* | Deploys autonomous dead-man's switch | Executes 100% inside the user's Google Apps Script environment with zero company intermediaries. |

---

## 3. Data Synchronization & Multi-Device Convergence

- **Document State**: Financial records (Money Flows, Possessions, Wishes, Groups) are modeled as Conflict-Free Replicated Data Types (CRDTs).
- **Snapshot Storage**: When changes occur, an encrypted snapshot is saved to `drive.appdata`.
- **Cross-Device Sync**: When logging into Worth Diary from a different computer or smartphone, the client retrieves the encrypted state from Google Drive and merges changes deterministically with zero data conflict.
