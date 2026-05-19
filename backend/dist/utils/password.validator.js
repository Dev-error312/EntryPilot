"use strict";
/**
 * Password strength validator
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = validatePasswordStrength;
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=password.validator.js.map