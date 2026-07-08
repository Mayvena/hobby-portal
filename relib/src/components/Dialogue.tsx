// Basic dialogue template component, receives a title and content as props and renders a dialogue box with a close button.

import React, { useEffect, useId, useRef } from 'react';
import { DimOverlay } from './DimOverlay';

interface DialogueProps {
    title: string;
    content: React.ReactNode;
    onClose: () => void;
    useDimOverlay?: boolean;
}

const DialogueContent: React.FC<Omit<DialogueProps, 'useDimOverlay'>> = ({
    title,
    content,
    onClose,
}) => {
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    return (
        <div
            ref={dialogRef}
            className="dialogue"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            }}
        >
            <div className="dialogue-header">
                <h2 id={titleId}>{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close dialog">Close</button>
            </div>
            <div className="dialogue-content">
                {content}
            </div>
        </div>
    );
};

export const Dialogue: React.FC<DialogueProps> = ({
    title,
    content,
    onClose,
    useDimOverlay = false,
}) => {
    if (!useDimOverlay) {
        return <DialogueContent title={title} content={content} onClose={onClose} />;
    }

    return (
        <div className="dialogue-modal">
            <DimOverlay />
            <DialogueContent title={title} content={content} onClose={onClose} />
        </div>
    );
};