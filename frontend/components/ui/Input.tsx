import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export function Input({ label, error, fullWidth = false, className = '', type, ...props }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`input-wrapper ${fullWidth ? 'w-full' : 'w-auto'}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="password-toggle-wrapper">
                <input
                    type={inputType}
                    className={`input-field ${className} ${error ? 'input-field-error' : ''} ${fullWidth ? 'w-full' : ''} ${isPassword ? 'password-input-helper' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
}

export default Input;
