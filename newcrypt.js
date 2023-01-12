var cryptoEngine = 
((function(){
const exports = {};
  
/**
 * Salt and encrypt a msg with a password.
 */
function encrypt(msg, hashedPassphrase) {
  var iv = CryptoJS.lib.WordArray.random(128 / 8);
  var encrypted = CryptoJS.AES.encrypt(msg, hashedPassphrase, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  // iv will be hex 16 in length (32 characters)
  // we prepend it to the ciphertext for use in decryption
  return iv.toString() + encrypted.toString();
}
exports.encrypt = encrypt;

/**
 * Decrypt a salted msg using a password.
 *
 * @param {string} encryptedMsg
 * @param {string} hashedPassphrase
 * @returns {string}
 */
function decrypt(encryptedMsg, hashedPassphrase) {
  var iv = CryptoJS.enc.Hex.parse(encryptedMsg.substr(0, 32));
  var encrypted = encryptedMsg.substring(32);
  return CryptoJS.AES.decrypt(encrypted, hashedPassphrase, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8);
}
exports.decrypt = decrypt;

/**
 * Salt and hash the passphrase so it can be stored in localStorage without opening a password reuse vulnerability.
 *
 * @param {string} passphrase
 * @param {string} salt
 * @returns string
 */
function hashPassphrase(passphrase, salt) {
  var hashedPassphrase = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  return hashedPassphrase.toString();
}
exports.hashPassphrase = hashPassphrase;

function signMessage(hashedPassphrase, message) {
  return CryptoJS.HmacSHA256(
    message,
    CryptoJS.SHA256(hashedPassphrase).toString()
  ).toString();
}
exports.signMessage = signMessage;

return exports;
})())

var codec = 
((function(){
  const exports = {};
  /**
 * Initialize the codec with the provided cryptoEngine - this return functions to encode and decode messages.
 *
 * @param cryptoEngine - the engine to use for encryption / decryption
 */
function init(cryptoEngine) {
  const exports = {};

  /**
   * Top-level function for encoding a message.
   * Includes passphrase hashing, encryption, and signing.
   *
   * @param {string} msg
   * @param {string} passphrase
   * @param {string} salt
   *
   * @returns {string} The encoded text
   */
  function encode(msg, passphrase, salt) {
    const hashedPassphrase = cryptoEngine.hashPassphrase(passphrase, salt);
    const encrypted = cryptoEngine.encrypt(msg, hashedPassphrase);
    // we use the hashed passphrase in the HMAC because this is effectively what will be used a passphrase (so we can store
    // it in localStorage safely, we don't use the clear text passphrase)
    const hmac = cryptoEngine.signMessage(hashedPassphrase, encrypted);
    return hmac + encrypted;
  }
  exports.encode = encode;

  /**
   * Top-level function for decoding a message.
   * Includes signature check, an decryption.
   *
   * @param {string} signedMsg
   * @param {string} hashedPassphrase
   *
   * @returns {Object} {success: true, decoded: string} | {success: false, message: string}
   */
  function decode(signedMsg, hashedPassphrase) {
    const encryptedHMAC = signedMsg.substring(0, 64);
    const encryptedMsg = signedMsg.substring(64);
    const decryptedHMAC = cryptoEngine.signMessage(hashedPassphrase, encryptedMsg);
    if (decryptedHMAC !== encryptedHMAC) {
      return { success: false, message: "Signature mismatch" };
    }
    return {
      success: true,
      decoded: cryptoEngine.decrypt(encryptedMsg, hashedPassphrase),
    };
  }
  exports.decode = decode;
  return exports;
}
exports.init = init;

return exports;
})())

var decode = codec.init(cryptoEngine).decode;
var encode = codec.init(cryptoEngine).encode;

// variables to be filled when generating the file
var
  salt = 'a59e9b3a47972726974d35dbc0148fe2',
  //labelError = '',
  //isRememberEnabled = true,
  rememberDurationInDays = 7; // 0 means forever

// constants
var rememberPassphraseKey = 'CX_passphrase',
    rememberExpirationKey = 'CX_expiration';

/**
 * Decrypt our encrypted page, replace the whole HTML.
 *
 * @param  hashedPassphrase
 * @returns 
 */
function decryptHashed(encryptedMsg, hashedPassphrase) {
    var result = decode(encryptedMsg, hashedPassphrase);
    if (!result.success) {
        return false;
    }
    plainHTML = result.decoded;
    return true;
}

/**
 * Clear localstorage from crypt related values
 */
function clearLocalStorage() {
    localStorage.removeItem(rememberPassphraseKey);
    localStorage.removeItem(rememberExpirationKey);
}

function DecryptLinks(hashedPassphrase) {
  for (var i=1; i<=Files.length; i++) {
    encryptedLink = Files[i-1];
    isDecryptionSuccessful = decryptHashed(encryptedLink, hashedPassphrase);
    if (isDecryptionSuccessful) createOpt(plainHTML, Files[i].substring(0, 18))
    else {
        createOpt("", "Грешна парола");
        document.getElementById("MsgText").value="Програмата е напълно функционална, но няма да изпраща данни.";
        return isDecryptionSuccessful;
    }
    i++;
  }
}

/**
 * To be called on load: check if we want to try to decrypt and replace the HTML with the decrypted content, and
 * try to do it if needed.
 *
 * @returns  true if we derypted and replaced the whole page, false otherwise
 */
function decryptOnLoadFromRememberMe() {
  if (rememberDurationInDays && rememberDurationInDays > 0) {
      var expiration = localStorage.getItem(rememberExpirationKey),
          isExpired = expiration && new Date().getTime() > parseInt(expiration);
      if (isExpired) {
          clearLocalStorage();
          return false;
      }
  }
  var hashedPassphrase = localStorage.getItem(rememberPassphraseKey);
  // console.log(hashedPassphrase);
  if (hashedPassphrase) {
    // try to decrypt
    var isDecryptionSuccessful = decryptHashed(Files[0], hashedPassphrase);
    // if the decryption is unsuccessful the password might be wrong - silently clear the saved data and let
    // the user fill the password form again
    if (!isDecryptionSuccessful) {
      clearLocalStorage();
      return false;
    }
    DecryptLinks(hashedPassphrase);
    /*
    for (var i=1; i<=Files.length; i++) {
      encryptedLink = Files[i-1];
      isDecryptionSuccessful = decryptHashed(encryptedLink, hashedPassphrase);
      if (isDecryptionSuccessful) createOpt(plainHTML, Files[i].substring(0, 18))
      else {
          createOpt("", "Грешна парола");
          document.getElementById("MsgText").value="Програмата е напълно функционална, но няма да изпраща данни.";
      }
      i++;
    }*/
    document.getElementById('Password').value = "11111111111111111111"; // dummy password to indicate remembered password is get
    AlreadyDecripted = true;
    return true;
  }
  return false;
}

// try to automatically decrypt on load if there is a saved password
function createFilesDec() {
  if (AlreadyDecripted) return;
  var 
      passphrase = document.getElementById('Password').value,
      shouldRememberPassphrase = document.getElementById('RCookie').checked;

  // encrypt plain text links for future usage and fill Log with encrypted result
  var link = Files[0];
  if (link.substring(0,5) == "https")	{
    for (var i=1; i<=Files.length; i++) {
      link = Files[i-1];
      // console.log(link.substring(0,5));
      encryptedLink = encode(link, passphrase, salt);
      document.getElementById('Log').value += '  "'+encryptedLink+'",\n';
      i++;
    }
  }
  // decrypt links
  var hashedPassphrase = cryptoEngine.hashPassphrase(passphrase, salt);
  var isDecryptionSuccessful = decryptHashed(Files[0], hashedPassphrase);
  if (shouldRememberPassphrase) {
    window.localStorage.setItem(rememberPassphraseKey, hashedPassphrase);
    // set the expiration if the duration isn't 0 (meaning no expiration)
    if (rememberDurationInDays > 0) {
        window.localStorage.setItem(
          rememberExpirationKey,
          (new Date().getTime() + rememberDurationInDays * 24 * 60 * 60 * 1000).toString()
        );
    }
  }
  // if (isDecryptionSuccessful) 
  DecryptLinks(hashedPassphrase);
  /*
  for (var i=1; i<=Files.length; i++) {
    encryptedLink = Files[i-1];
    isDecryptionSuccessful = decryptHashed(encryptedLink, hashedPassphrase);
    if (isDecryptionSuccessful) createOpt(plainHTML, Files[i].substring(0, 18))
    else {
        createOpt("", "Грешна парола");
        document.getElementById("MsgText").value="Програмата е напълно функционална, но няма да изпраща данни.";
    }
    //console.log(encryptedLink);
    //console.log(plainHTML);
    i++;
  }*/
};
