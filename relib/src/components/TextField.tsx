// TextField component, receives parameters for label, value, and onChange handler, and renders a text input field with a label, and type of the field [text, password, email, etc.].

import React, { useId } from 'react'; 
interface TextFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ id, label, value, onChange, type = 'text' }) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="text-field">
            <label htmlFor={inputId}>
                {label}
                <input id={inputId} type={type} value={value} onChange={onChange} />
            </label>
        </div>
    );
};