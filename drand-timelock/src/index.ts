/**
 * Drand Time-Lock Encryption & Decryption Reference Implementation
 * Powered by Worth Diary (https://www.worthdiary.com)
 * 
 * Uses identity-based threshold encryption over the League of Entropy
 * decentralized Drand beacon network (Quicknet, 3-second round cadence).
 */

import {
  timelockEncrypt,
  timelockDecrypt,
  HttpChainClient,
  HttpCachingChain,
} from 'tlock-js';

// Drand Quicknet (Mainnet unchained BLS beacon) parameters
export const QUICKNET_CHAIN_INFO = {
  public_key:
    '83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a',
  period: 3, // 3 seconds per round
  genesis_time: 1692803367, // Aug 23, 2023 15:09:27 UTC
  hash: '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971',
  groupHash: 'f477d5c89f21a17c863a7f937c6a6d15859414d2be09cd448d4279af331c5d3e',
  schemeID: 'bls-unchained-g1-rfc9380',
  metadata: {
    beaconID: 'quicknet',
  },
};

// Independent redundant relays operated by diverse entities
export const DRAND_RELAYS = [
  `https://drand.cloudflare.com/${QUICKNET_CHAIN_INFO.hash}`,
  `https://api.drand.sh/${QUICKNET_CHAIN_INFO.hash}`,
  `https://api.tlock.ch/${QUICKNET_CHAIN_INFO.hash}`,
];

/**
 * Calculates future Drand round corresponding to target date/time
 */
export function dateToRound(targetDate: Date): number {
  const targetTimeSec = Math.floor(targetDate.getTime() / 1000);
  if (targetTimeSec <= QUICKNET_CHAIN_INFO.genesis_time) {
    return 1;
  }
  return Math.floor(
    (targetTimeSec - QUICKNET_CHAIN_INFO.genesis_time) / QUICKNET_CHAIN_INFO.period
  ) + 1;
}

/**
 * 100% Offline Encryption: Encrypts data to a future round without making network requests.
 */
export async function encryptToFutureDate(
  plainText: string,
  unlockDate: Date
): Promise<string> {
  const round = dateToRound(unlockDate);
  const offlineClient: any = {
    chain: () => ({
      info: async () => QUICKNET_CHAIN_INFO,
    }),
  };

  const buffer = Buffer.from(plainText, 'utf-8');
  const cipherText = await timelockEncrypt(round, buffer, offlineClient);
  return cipherText;
}

/**
 * Decrypts a .tlock ciphertext by retrieving the threshold signature from Drand relays.
 * Will throw an error if the target round has not yet been reached.
 */
export async function decryptTimelock(cipherText: string): Promise<string> {
  let lastError: any = null;

  const chainOptions = {
    disableBeaconVerification: false,
    noCache: false,
    chainVerificationParams: {
      chainHash: QUICKNET_CHAIN_INFO.hash,
      publicKey: QUICKNET_CHAIN_INFO.public_key,
    },
  };

  for (const relayUrl of DRAND_RELAYS) {
    try {
      const chain = new HttpCachingChain(relayUrl, chainOptions);
      const client = new HttpChainClient(chain, chainOptions);
      const decryptedBuffer = await timelockDecrypt(cipherText, client);
      return Buffer.from(decryptedBuffer).toString('utf-8');
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(`Failed to decrypt from all Drand relays: ${lastError?.message || lastError}`);
}

async function runDemo() {
  console.log('--- Drand TimeLock Encryption Demo ---');
  const secretMessage = 'Confidential estate instruction: Safe passcode is 8492-4910';
  
  // Encrypt to 10 seconds into the future
  const unlockDate = new Date(Date.now() + 10 * 1000);
  const targetRound = dateToRound(unlockDate);

  console.log(`Current Time: ${new Date().toISOString()}`);
  console.log(`Target Unlock: ${unlockDate.toISOString()} (Round ${targetRound})`);
  
  const encrypted = await encryptToFutureDate(secretMessage, unlockDate);
  console.log('\nGenerated .tlock Ciphertext:\n', encrypted.slice(0, 180) + '...\n');

  console.log('Attempting early decryption (should fail mathematically)...');
  try {
    await decryptTimelock(encrypted);
    console.log('Unexpected success!');
  } catch (err: any) {
    console.log('✓ Early decryption blocked as expected:', err.message);
  }
}

if (require.main === module) {
  runDemo().catch(console.error);
}
