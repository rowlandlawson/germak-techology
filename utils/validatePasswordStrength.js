export default function validatePasswordStrength(password) {
    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    return isStrong;
  }
  