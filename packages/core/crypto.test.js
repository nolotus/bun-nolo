import {
  signMessage,
  verifySignedMessage,
  detachedSign,
  verifyDetachedSignature,
} from "./crypto";
import { generateKeyPairFromSeedV0 } from "./generateKeyPairFromSeedV0";

test("End-to-end test", () => {
  const seedData = "randomseed";
  const message = "randommessage";

  // Generate key pair from seed
  const keyPair = generateKeyPairFromSeedV0(seedData);

  // Sign the message using the secret key
  const signedMessage = signMessage(message, keyPair.secretKey);

  // Verify the signed message using the public key
  const verifiedMessage = verifySignedMessage(signedMessage, keyPair.publicKey);

  // Detached sign the message using the secret key
  const signature = detachedSign(message, keyPair.secretKey);

  // Verify the detached signature using the message and public key
  const isVerified = verifyDetachedSignature(
    message,
    signature,
    keyPair.publicKey
  );

  expect(signedMessage).toBeTruthy();
  expect(verifiedMessage).toBeTruthy();
  expect(signature).toBeTruthy();
  expect(isVerified).toBeTruthy();
});
