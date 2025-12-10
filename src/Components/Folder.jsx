import React from 'react';

const Folder = ({ name, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative w-full max-w-[300px] aspect-4/3 cursor-pointer 
                       transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] 
                       hover:-translate-y-2"
        >
            {/* Back Plate */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#5FB6F3] dark:bg-[#007AFF]
                            rounded-xl shadow-lg 
                            transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            group-hover:shadow-2xl"></div>

            {/* Papers inside */}
            <div className="absolute top-4 left-4 w-[85%] h-[80%] bg-white dark:bg-gray-200 rounded-lg 
                            shadow-sm transform -rotate-3 opacity-90
                            transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            group-hover:-translate-y-3 group-hover:-rotate-6 z-10"></div>

            <div className="absolute top-4 left-6 w-[85%] h-[80%] bg-white dark:bg-gray-100 rounded-lg 
                            shadow-sm transform rotate-2 opacity-95
                            transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            group-hover:-translate-y-4 group-hover:rotate-4 z-10"></div>

            {/* Folder Tab (Back Layer) - Positioned to look like the tab */}
            <div className="absolute -top-3 left-0 w-1/3 h-[18%] bg-[#5FB6F3] dark:bg-[#007AFF] 
                            rounded-t-xl
                            transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></div>

            {/* Front Plate */}
            <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#7AC9F9] to-[#4AA3F0] dark:from-[#3395FF] dark:to-[#0066CC]
                            rounded-b-xl rounded-t-lg shadow-inner z-20
                            flex items-end justify-center pb-4 overflow-hidden
                            transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            border-t border-[#8ED4FC] dark:border-[#52A9FF]">

                {/* Subtle shine/highlight */}
                <div className="absolute top-0 left-0 w-full h-[15%] 
                                bg-gradient-to-b from-white/30 to-transparent 
                                pointer-events-none"></div>

                <span className="text-md font-semibold text-black/60 dark:text-white/90 drop-shadow-sm truncate px-4 max-w-full">
                    {name}
                </span>
            </div>
        </div>
    );
};

export default Folder;
