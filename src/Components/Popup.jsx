import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Popup Component - Replaces native alert/confirm dialogs
 * 
 * @param {boolean} isOpen - Whether the popup is visible
 * @param {function} onClose - Function to close the popup
 * @param {function} onConfirm - Function called when confirm button is clicked (optional)
 * @param {string} title - Popup title
 * @param {string} message - Popup message
 * @param {string} type - 'info' | 'success' | 'warning' | 'error' | 'confirm'
 * @param {string} confirmText - Text for confirm button (default: 'OK')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 */
const Popup = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const icons = {
        info: <Info className="text-blue-500" size={28} />,
        success: <CheckCircle className="text-green-500" size={28} />,
        warning: <AlertTriangle className="text-yellow-500" size={28} />,
        error: <AlertCircle className="text-red-500" size={28} />,
        confirm: <AlertTriangle className="text-orange-500" size={28} />
    };

    const isConfirmType = type === 'confirm';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                            {icons[type]}
                        </div>
                    </div>

                    {/* Title */}
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className={`p-4 pt-2 flex gap-3 ${isConfirmType ? 'justify-center' : 'justify-center'}`}>
                    {isConfirmType && (
                        <button
                            onClick={onClose}
                            className="flex-1 max-w-[140px] px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            if (!isConfirmType) onClose();
                        }}
                        className={`flex-1 max-w-[140px] px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${type === 'error' || type === 'confirm'
                                ? 'bg-red-500 hover:bg-red-600'
                                : type === 'success'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : type === 'warning'
                                        ? 'bg-yellow-500 hover:bg-yellow-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
