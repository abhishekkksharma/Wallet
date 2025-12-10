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
        const video = webcamRef.current.video;

        if (!imageSrc || !video) return;

        // Get the actual video dimensions
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Get the screen/container dimensions
        // Since the component is fixed inset-0, we can use window dimensions
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Calculate the scale factor that 'object-cover' applies
        // object-cover scales the image to cover the container while maintaining aspect ratio
        const scale = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);

        // Calculate the dimensions of the video as displayed on screen
        const displayedWidth = videoWidth * scale;
        const displayedHeight = videoHeight * scale;

        // Calculate the offset (how much is cropped out by CSS)
        const offsetX = (displayedWidth - containerWidth) / 2;
        const offsetY = (displayedHeight - containerHeight) / 2;

        // The guide box dimensions (must match the CSS)
        const boxWidth = 350;
        const boxHeight = 220;

        // Calculate the guide box position relative to the container
        const boxLeft = (containerWidth - boxWidth) / 2;
        const boxTop = (containerHeight - boxHeight) / 2;

        // Map the guide box coordinates to the video source coordinates
        // 1. Add offset to get position relative to the displayed video
        // 2. Divide by scale to get position in the source video
        const sourceX = (boxLeft + offsetX) / scale;
        const sourceY = (boxTop + offsetY) / scale;
        const sourceWidth = boxWidth / scale;
        const sourceHeight = boxHeight / scale;

        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to the desired output size (we can keep it high res)
            // Let's use 2x the box size for good quality
            canvas.width = boxWidth * 2;
            canvas.height = boxHeight * 2;

            ctx.drawImage(
                image,
                sourceX, sourceY, sourceWidth, sourceHeight, // Source crop
                0, 0, canvas.width, canvas.height            // Destination
            );

            const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
            onCapture(croppedImage);
        };
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
