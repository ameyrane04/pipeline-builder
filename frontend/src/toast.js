// toast.js

import { useState, useEffect, useCallback } from 'react';

let toastFn = null;

export const showToast = (message, type = 'info', duration = 4000) => {
    if (toastFn) toastFn({ message, type, duration });
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Register the show function when this component mounts
    useEffect(() => {
        toastFn = ({ message, type, duration }) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message, type }]);
            // Auto-remove after duration
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        };
        return () => { toastFn = null; };
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => remove(toast.id)}
                >
                    <span className="toast-icon">
                        {toast.type === 'success' && '✅'}
                        {toast.type === 'error' && '❌'}
                        {toast.type === 'info' && 'ℹ️'}
                        {toast.type === 'warning' && '⚠️'}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close">×</button>
                </div>
            ))}
        </div>
    );
};