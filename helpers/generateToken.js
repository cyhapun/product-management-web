module.exports.generateToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array); // secure random
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
