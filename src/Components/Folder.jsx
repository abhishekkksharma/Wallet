import React from 'react';

const Folder = ({ name, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative w-full max-w-[300px] aspect-[4/3] cursor-pointer transition-transform hover:scale-105"
        >
            {/* Back Plate */}
            <div className="absolute top-0 left-0 w-full h-full bg-gray-800 rounded-xl shadow-lg transform translate-y-1"></div>

            {/* Papers inside */}
            <div className="absolute top-2 left-2 w-[90%] h-[80%] bg-white rounded-lg shadow-sm transform -rotate-3 opacity-90"></div>
            <div className="absolute top-2 left-4 w-[90%] h-[80%] bg-white rounded-lg shadow-sm transform rotate-2 opacity-95"></div>

            {/* Front Glass Plate */}
            <div className="absolute bottom-0 left-0 w-full h-[70%] bg-white/10 backdrop-blur-md border border-white/20 rounded-b-xl rounded-tr-xl shadow-inner flex items-end justify-center pb-4 overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                <span className="text-sm font-bold text-white drop-shadow-md truncate px-4 max-w-full">
                    {name}
                </span>
            </div>

            {/* Folder Tab */}
            <div className="absolute top-[15%] left-0 w-1/3 h-[15%] bg-white/10 backdrop-blur-md border-t border-l border-white/20 rounded-t-lg"></div>
        </div>
    );
};

export default Folder;
