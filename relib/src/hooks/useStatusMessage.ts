import { useCallback, useEffect, useRef, useState } from 'react';

export const useStatusMessage = (timeoutMs = 3000) => {
    const [statusMessage, setStatusMessage] = useState('');
    const timeoutRef = useRef<number | null>(null);

    const clearStatusMessage = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setStatusMessage('');
    }, []);

    const showStatusMessage = useCallback((message: string) => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }

        setStatusMessage(message);
        timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = null;
            setStatusMessage('');
        }, timeoutMs);
    }, [timeoutMs]);

    useEffect(() => clearStatusMessage, [clearStatusMessage]);

    return {
        statusMessage,
        showStatusMessage,
        clearStatusMessage,
    };
};