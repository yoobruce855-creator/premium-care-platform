/**
 * Password policy configuration
 */
const PASSWORD_POLICY = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventReuse: 5, // Prevent reusing last 5 passwords
    expiryDays: 90 // Password expires after 90 days
};

/**
 * Common weak passwords to reject
 */
const COMMON_PASSWORDS = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
    'bailey', 'passw0rd', 'shadow', '123123', '654321'
];

/**
 * Validate password against policy
 */
export function validatePassword(password) {
    const errors = [];

    if (!password) {
        return { valid: false, errors: ['Password is required'] };
    }

    // Length check
    if (password.length < PASSWORD_POLICY.minLength) {
        errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
    }

    if (password.length > PASSWORD_POLICY.maxLength) {
        errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
    }

    // Uppercase check
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Special character check
    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Common password check
    if (PASSWORD_POLICY.preventCommonPasswords) {
        const lowerPassword = password.toLowerCase();
        if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
            errors.push('Password is too common. Please choose a stronger password');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
    };
}

/**
 * Calculate password strength score (0-100)
 */
function calculatePasswordStrength(password) {
    let score = 0;

    // Length score (max 30 points)
    score += Math.min(password.length * 2, 30);

    // Character variety (max 40 points)
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

    // Complexity bonus (max 30 points)
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    // No repeating characters bonus
    if (!/(.)\1{2,}/.test(password)) score += 10;

    return Math.min(score, 100);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score) {
    if (score < 30) return { label: 'Weak', color: 'red' };
    if (score < 50) return { label: 'Fair', color: 'orange' };
    if (score < 70) return { label: 'Good', color: 'yellow' };
    if (score < 90) return { label: 'Strong', color: 'lightgreen' };
    return { label: 'Very Strong', color: 'green' };
}

/**
 * Check if password is expired
 */
export function isPasswordExpired(lastChangedDate) {
    if (!PASSWORD_POLICY.expiryDays) return false;

    const expiryDate = new Date(lastChangedDate);
    expiryDate.setDate(expiryDate.getDate() + PASSWORD_POLICY.expiryDays);

    return new Date() > expiryDate;
}

/**
 * Get days until password expires
 */
export function getDaysUntilExpiry(lastChangedDate) {
    if (!PASSWORD_POLICY.expiryDays) return null;

    const expiryDate = new Date(lastChangedDate);
    expiryDate.setDate(expiryDate.getDate() + PASSWORD_POLICY.expiryDays);

    const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get password policy information
 */
export function getPasswordPolicy() {
    return {
        ...PASSWORD_POLICY,
        description: `Password must be ${PASSWORD_POLICY.minLength}-${PASSWORD_POLICY.maxLength} characters long, ` +
            `contain uppercase and lowercase letters, numbers, and special characters.`
    };
}

export default {
    validatePassword,
    getPasswordStrengthLabel,
    isPasswordExpired,
    getDaysUntilExpiry,
    generateSecurePassword,
    getPasswordPolicy
};
