import React, { useRef } from 'react';

const Folder = ({ name, onClick }) => {
    const paper1Ref = useRef(null);
    const paper2Ref = useRef(null);
    const containerRef = useRef(null);

    const handleMouseEnter = () => {
        if (containerRef.current) {
            containerRef.current.style.transform = 'translate3d(0, -12px, 0)';
        }
        if (paper1Ref.current) {
            paper1Ref.current.style.transform = 'translate3d(0, -16px, 0) rotate(-6deg)';
        }
        if (paper2Ref.current) {
            paper2Ref.current.style.transform = 'translate3d(0, -20px, 0) rotate(5deg)';
        }
    };

    const handleMouseLeave = () => {
        if (containerRef.current) {
            containerRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
        if (paper1Ref.current) {
            paper1Ref.current.style.transform = 'translate3d(0, 0, 0) rotate(-3deg)';
        }
        if (paper2Ref.current) {
            paper2Ref.current.style.transform = 'translate3d(0, 0, 0) rotate(2deg)';
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative w-full max-w-[300px] aspect-4/3 cursor-pointer"
            style={{
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: 'translate3d(0, 0, 0)',
            }}
        >
            {/* Back Plate */}
            <div
                className="absolute top-0 left-0 w-full h-full bg-[#5FB6F3] dark:bg-[#007AFF]
                            rounded-xl shadow-lg group-hover:shadow-2xl"
                style={{ transition: 'box-shadow 0.5s ease' }}
            ></div>

            {/* Papers inside */}
            <div
                ref={paper1Ref}
                className="absolute top-4 left-4 w-[85%] h-[80%] bg-white dark:bg-gray-200 rounded-lg 
                            shadow-sm opacity-90 z-10"
                style={{
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'translate3d(0, 0, 0) rotate(-3deg)',
                }}
            ></div>

            <div
                ref={paper2Ref}
                className="absolute top-4 left-6 w-[85%] h-[80%] bg-white dark:bg-gray-100 rounded-lg 
                            shadow-sm opacity-95 z-10"
                style={{
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'translate3d(0, 0, 0) rotate(2deg)',
                }}
            ></div>

            {/* Folder Tab (Back Layer) */}
            <div className="absolute -top-3 left-0 w-1/3 h-[18%] bg-[#5FB6F3] dark:bg-[#007AFF] 
                            rounded-t-xl"></div>

            {/* Front Plate */}
            <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#7AC9F9] to-[#4AA3F0] dark:from-[#3395FF] dark:to-[#0066CC]
                            rounded-b-xl rounded-t-lg shadow-inner z-20
                            flex items-end justify-center pb-4 overflow-hidden
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
