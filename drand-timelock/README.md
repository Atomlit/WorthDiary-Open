# Decentralized Drand Time-Lock Encryption Demo

This directory provides a standalone reference implementation demonstrating how **time-locked encryption** works in [Worth Diary](https://www.worthdiary.com) and the [Worth Diary Free TimeLock Safe](https://www.worthdiary.com/tools/timelock/).

## How It Works

Traditional encryption requires storing private keys or trusting an escrow custodian to release a key at a specific date. If the custodian vanishes, the file is either lost forever or revealed prematurely.

**Time-Lock Threshold Cryptography (`tlock`)** eliminates custodians:
1. **Unchained Randomness Beacon (Drand / League of Entropy)**:
   - A global decentralized consortium of independent universities and organizations (Cloudflare, Protocol Labs, EPFL, Kudelski Security, University of Chile) collaboratively emits an unchained BLS threshold signature every 3 seconds (Quicknet).
2. **Identity-Based Encryption (IBE)**:
   - Plaintext is encrypted to a **future round number** using the network's public key.
   - The private decryption key **does not exist anywhere in the universe** until the round is reached and the consortium signs that round.
3. **Mathematical Impossibility of Early Decryption**:
   - No government, supercomputer, or company (including Worth Diary or Protocol Labs) can decrypt the file before the designated timestamp.
4. **Offline Encryption**:
   - Because the future round number and network public key are deterministic and mathematically fixed, encryption can be executed **100% offline without an internet connection**.

---

## Interoperability & Open Standards

Files encrypted with this format use standard `.tlock` / `age` encryption wrappers. If Worth Diary ever ceases to exist, your files can still be decrypted using:
- **Command-line utilities**: `tle` (`tle -d secret.tlock`)
- **Independent university portals**: `https://tlock.ch/`
- **Protocol Labs reference tools**: `https://timevault.drand.love/`

---

## Running the Demo

```bash
# Install dependencies
npm install

# Run the TypeScript demonstration
npm run demo
```

---

## Official Links

- **Free Browser Tool**: [https://www.worthdiary.com/tools/timelock/](https://www.worthdiary.com/tools/timelock/)
- **Main Application**: [https://app.worthdiary.com](https://app.worthdiary.com)
- **Technical Articles**: [https://www.worthdiary.com/blog/](https://www.worthdiary.com/blog/)
