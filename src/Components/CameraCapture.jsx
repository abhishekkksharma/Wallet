import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RotateCcw } from 'lucide-react';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Use back camera by default on mobile
};

const CameraCapture = ({ onCapture, onClose }) => {
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        onCapture(imageSrc);
    }, [webcamRef, onCapture]);

    const switchCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
                <button onClick={onClose} className="text-white p-2 rounded-full bg-black/40 backdrop-blur-md">
                    <X size={24} />
                </button>
                <button onClick={switchCamera} className="text-white p-2 rounded-full bg-black/40 backdrop-blur-md">
                    <RotateCcw size={24} />
                </button>
            </div>

            {/* Camera Feed */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        ...videoConstraints,
                        facingMode
                    }}
                    className="absolute min-w-full min-h-full object-cover"
                />

                {/* Dark Overlay with Cutout */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Top Mask */}
                    <div className="absolute top-0 left-0 right-0 h-[calc(50%-110px)] bg-black/60"></div>
                    {/* Bottom Mask */}
                    <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-110px)] bg-black/60"></div>
                    {/* Left Mask */}
                    <div className="absolute top-[calc(50%-110px)] bottom-[calc(50%-110px)] left-0 w-[calc(50%-175px)] bg-black/60"></div>
                    {/* Right Mask */}
                    <div className="absolute top-[calc(50%-110px)] bottom-[calc(50%-110px)] right-0 w-[calc(50%-175px)] bg-black/60"></div>

                    {/* The Cutout Border (The Guide) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[220px] border-2 border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>

                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            Align card here
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Capture Button */}
            <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 pb-4">
                <button
                    onClick={capture}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
            </div>
        </div>
    );
};

export default CameraCapture;
