// Button component

import React from 'react';

interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'button' }) => {
    return (
        <button type={type} onClick={onClick}>
            {label}
        </button>
    );
};