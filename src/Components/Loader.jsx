import React from 'react';

const Loader = ({ size = 'medium', color = 'blue' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4',
    };

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-400',
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-t-transparent rounded-full animate-spin
        `}
            />
        </div>
    );
};

export default Loader;
