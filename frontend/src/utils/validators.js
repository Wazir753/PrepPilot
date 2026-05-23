export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  return { valid: errors.length === 0, errors };
}

export function validateName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  return { valid: true, error: null };
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {};
  const nameResult = validateName(name);
  if (!nameResult.valid) errors.name = nameResult.error;
  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Invalid email address';
  const passResult = validatePassword(password);
  if (!passResult.valid) errors.password = passResult.errors[0];
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateInterviewSetup({ role, interviewType, difficulty }) {
  const errors = {};
  if (!role) errors.role = 'Target role is required';
  if (!interviewType) errors.interviewType = 'Interview type is required';
  if (!difficulty) errors.difficulty = 'Difficulty is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProfileForm({ name, bio }) {
  const errors = {};
  const nameResult = validateName(name);
  if (!nameResult.valid) errors.name = nameResult.error;
  if (bio && bio.length > 500) errors.bio = 'Bio must be under 500 characters';
  return { valid: Object.keys(errors).length === 0, errors };
}
