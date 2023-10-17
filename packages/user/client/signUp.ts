import {API_ENDPOINTS} from 'database/config';
import {generateUserId} from 'core/generateMainKey';
import {
  encryptWithPassword,
  generateAndSplitRecoveryPassword,
  hashPassword,
} from 'core/password';
import {
  generateKeyPairFromSeed,
  verifySignedMessage,
} from 'core/crypto';
import {getLogger} from 'utils/logger';
import {SignupData} from '../types';
import {signToken} from 'auth/token';

const signupLogger = getLogger('signup');

const sendToServer = async (data: {
  username: string;
  publicKey: string;
  language: string;
  remoteRecoveryPassword: string | null;
  encryptedEncryptionKey: string | null;
}): Promise<any> => {
  const body = data;
  const response = await fetch(API_ENDPOINTS.USERS + '/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message);
  }

  const result = await response.json();
  return result; // Assuming the server returns an object with a userId field
};

export const handleSignup = async (user, isStoreRecovery?) => {
  const {username, password: brainPassword, answer} = user;
  // Generate encryption key
  const encryptionKey = await hashPassword(brainPassword);
  // Get the user's language setting
  const language = navigator.language;

  // Generate public and private key pair based on the encryption key
  const {publicKey, secretKey} = generateKeyPairFromSeed(
    username + encryptionKey + language,
  );

  const sendData: SignupData = {
    username,
    publicKey,
    encryptedEncryptionKey: null,
    remoteRecoveryPassword: null,
    language,
  };

  if (isStoreRecovery) {
    const recoveryPassword = generateAndSplitRecoveryPassword(answer, 3);
    const [localRecoveryPassword, remoteRecoveryPassword] = recoveryPassword;

    sendData.remoteRecoveryPassword = remoteRecoveryPassword;
    sendData.encryptedEncryptionKey = encryptWithPassword(
      encryptionKey,
      recoveryPassword.join(''),
    );
  }

  const {encryptedData} = await sendToServer(sendData);

  const decryptedData = await verifySignedMessage(
    encryptedData,
    'pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus',
  );

  const decryptedDataObject = JSON.parse(decryptedData);
  console.log('decryptedDataObject:', decryptedDataObject);

  const userId = generateUserId(publicKey, username, language);
  console.log('sendData:', userId, sendData);
  const token = signToken({userId, username}, secretKey);

  if (
    decryptedDataObject.username === sendData.username &&
    decryptedDataObject.publicKey === sendData.publicKey &&
    decryptedDataObject.userId === userId
  ) {
    signupLogger.info('Server data matches local data.');
    return {token};
  } else {
    signupLogger.error('Server data does not match local data.');
    throw new Error('Server data does not match local data.');
  }
};
