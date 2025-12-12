import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { X, RotateCcw, Scan } from 'lucide-react';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
};

// Card detection configuration - SIMPLE & RELIABLE
const DETECTION_CONFIG = {
    MIN_VARIANCE: 800,         // Minimum pixel variance (detects if there's content)
    MIN_CONTRAST: 50,          // Minimum contrast in the region
    STABILITY_FRAMES: 20,       // Frames before auto-capture (~0.6s)
    STABILITY_THRESHOLD: 0.75, // Frame similarity (lower = more tolerant)
    ANALYSIS_INTERVAL: 120,    // ms between analyses
};

const CameraCapture = ({ onCapture, onClose }) => {
    const webcamRef = useRef(null);
    const analysisCanvasRef = useRef(null);
    const stabilityCountRef = useRef(0);
    const lastFrameDataRef = useRef(null);
    const analysisIntervalRef = useRef(null);

    const [facingMode, setFacingMode] = useState("environment");
    const [cardDetected, setCardDetected] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [detectionProgress, setDetectionProgress] = useState(0);
    const [autoMode, setAutoMode] = useState(true);

    // Simple content detection - checks if there's something interesting in the frame
    const detectContent = useCallback((imageData) => {
        const { data } = imageData;

        let sum = 0;
        let sumSq = 0;
        let min = 255;
        let max = 0;
        const sampleStep = 8; // Sample every 8th pixel for speed
        let count = 0;

        for (let i = 0; i < data.length; i += sampleStep * 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            sum += gray;
            sumSq += gray * gray;
            min = Math.min(min, gray);
            max = Math.max(max, gray);
            count++;
        }

        const mean = sum / count;
        const variance = (sumSq / count) - (mean * mean);
        const contrast = max - min;

        // Card detected if there's enough variance (not plain surface) AND contrast
        return variance >= DETECTION_CONFIG.MIN_VARIANCE && contrast >= DETECTION_CONFIG.MIN_CONTRAST;
    }, []);

    // Frame stability check
    const calculateFrameSimilarity = useCallback((currentData, previousData) => {
        if (!previousData || currentData.length !== previousData.length) return 0;

        let matchCount = 0;
        const sampleStep = 32;

        for (let i = 0; i < currentData.length; i += sampleStep * 4) {
            const diff = Math.abs(currentData[i] - previousData[i]) +
                Math.abs(currentData[i + 1] - previousData[i + 1]) +
                Math.abs(currentData[i + 2] - previousData[i + 2]);
            if (diff < 40) matchCount++;
        }

        return matchCount / (currentData.length / (sampleStep * 4));
    }, []);

    // Main analysis
    const analyzeFrame = useCallback(() => {
        if (!webcamRef.current?.video || isCapturing || !autoMode) return;

        const video = webcamRef.current.video;
        if (video.readyState !== 4) return;

        if (!analysisCanvasRef.current) {
            analysisCanvasRef.current = document.createElement('canvas');
        }
        const canvas = analysisCanvasRef.current;

        const analysisWidth = 120;
        const analysisHeight = 75;
        canvas.width = analysisWidth;
        canvas.height = analysisHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const containerWidth = video.offsetWidth;
        const containerHeight = video.offsetHeight;

        const boxWidth = 350;
        const boxHeight = 220;

        const videoAspect = videoWidth / videoHeight;
        const containerAspect = containerWidth / containerHeight;

        let scale, offsetX = 0, offsetY = 0;

        if (videoAspect > containerAspect) {
            scale = videoHeight / containerHeight;
            offsetX = (videoWidth - containerWidth * scale) / 2;
        } else {
            scale = videoWidth / containerWidth;
            offsetY = (videoHeight - containerHeight * scale) / 2;
        }

        const cropX = offsetX + ((containerWidth - boxWidth) / 2) * scale;
        const cropY = offsetY + ((containerHeight - boxHeight) / 2) * scale;
        const cropWidth = boxWidth * scale;
        const cropHeight = boxHeight * scale;

        ctx.drawImage(
            video,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, analysisWidth, analysisHeight
        );

        const imageData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
        const currentData = imageData.data;

        // Check for content
        const hasContent = detectContent(imageData);

        // Check stability
        const similarity = calculateFrameSimilarity(currentData, lastFrameDataRef.current);
        const isStable = similarity >= DETECTION_CONFIG.STABILITY_THRESHOLD;

        lastFrameDataRef.current = new Uint8ClampedArray(currentData);

        if (hasContent && isStable) {
            stabilityCountRef.current++;
            setDetectionProgress((stabilityCountRef.current / DETECTION_CONFIG.STABILITY_FRAMES) * 100);

            if (stabilityCountRef.current >= DETECTION_CONFIG.STABILITY_FRAMES) {
                setIsCapturing(true);
                capture();
            }
        } else if (hasContent) {
            // Has content but moving
            stabilityCountRef.current = Math.max(0, stabilityCountRef.current - 1);
            setDetectionProgress((stabilityCountRef.current / DETECTION_CONFIG.STABILITY_FRAMES) * 100);
        } else {
            stabilityCountRef.current = 0;
            setDetectionProgress(0);
        }

        setCardDetected(hasContent);
    }, [isCapturing, autoMode, detectContent, calculateFrameSimilarity]);

    useEffect(() => {
        if (autoMode) {
            analysisIntervalRef.current = setInterval(analyzeFrame, DETECTION_CONFIG.ANALYSIS_INTERVAL);
        }

        return () => {
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
            }
        };
    }, [autoMode, analyzeFrame]);

    const capture = useCallback(() => {
        const video = webcamRef.current?.video;
        if (!video) return;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const containerWidth = video.offsetWidth;
        const containerHeight = video.offsetHeight;

        const boxWidth = 350;
        const boxHeight = 220;

        const videoAspect = videoWidth / videoHeight;
        const containerAspect = containerWidth / containerHeight;

        let scale, offsetX = 0, offsetY = 0;

        if (videoAspect > containerAspect) {
            scale = videoHeight / containerHeight;
            offsetX = (videoWidth - containerWidth * scale) / 2;
        } else {
            scale = videoWidth / containerWidth;
            offsetY = (videoHeight - containerHeight * scale) / 2;
        }

        const cropX = offsetX + ((containerWidth - boxWidth) / 2) * scale;
        const cropY = offsetY + ((containerHeight - boxHeight) / 2) * scale;
        const cropWidth = boxWidth * scale;
        const cropHeight = boxHeight * scale;

        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = boxWidth;
        captureCanvas.height = boxHeight;
        const ctx = captureCanvas.getContext('2d');

        ctx.drawImage(
            video,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, boxWidth, boxHeight
        );

        const croppedImage = captureCanvas.toDataURL('image/jpeg', 0.95);
        onCapture(croppedImage);
    }, [onCapture]);

    const switchCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    const toggleAutoMode = () => {
        setAutoMode(prev => !prev);
        stabilityCountRef.current = 0;
        setDetectionProgress(0);
        setCardDetected(false);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
                <button onClick={onClose} className="text-white p-2 rounded-full bg-black/40 backdrop-blur-md">
                    <X size={24} />
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={toggleAutoMode}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${autoMode
                            ? 'bg-blue-500/80 text-white'
                            : 'bg-black/40 text-white/60'
                            }`}
                        title={autoMode ? 'Auto-capture ON' : 'Auto-capture OFF'}
                    >
                        <Scan size={24} />
                    </button>
                    <button onClick={switchCamera} className="text-white p-2 rounded-full bg-black/40 backdrop-blur-md">
                        <RotateCcw size={24} />
                    </button>
                </div>
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
                    <div className="absolute top-0 left-0 right-0 h-[calc(50%-110px)] bg-black/60"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-110px)] bg-black/60"></div>
                    <div className="absolute top-[calc(50%-110px)] bottom-[calc(50%-110px)] left-0 w-[calc(50%-175px)] bg-black/60"></div>
                    <div className="absolute top-[calc(50%-110px)] bottom-[calc(50%-110px)] right-0 w-[calc(50%-175px)] bg-black/60"></div>

                    <div
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[220px] rounded-xl transition-all duration-300 ${cardDetected
                            ? 'border-2 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]'
                            : 'border-2 border-white/80'
                            }`}
                    >
                        <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 rounded-tl-lg transition-colors duration-300 ${cardDetected ? 'border-green-400' : 'border-blue-500'}`}></div>
                        <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 rounded-tr-lg transition-colors duration-300 ${cardDetected ? 'border-green-400' : 'border-blue-500'}`}></div>
                        <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 rounded-bl-lg transition-colors duration-300 ${cardDetected ? 'border-green-400' : 'border-blue-500'}`}></div>
                        <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 rounded-br-lg transition-colors duration-300 ${cardDetected ? 'border-green-400' : 'border-blue-500'}`}></div>

                        {autoMode && cardDetected && detectionProgress > 0 && (
                            <div className="absolute -bottom-8 left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-400 transition-all duration-150 rounded-full"
                                    style={{ width: `${detectionProgress}%` }}
                                ></div>
                            </div>
                        )}

                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${cardDetected
                            ? 'bg-green-500/30 text-green-300'
                            : 'bg-black/40 text-white/80'
                            }`}>
                            {cardDetected
                                ? (autoMode ? 'Hold still...' : 'Card detected!')
                                : 'Align card here'
                            }
                        </div>

                        {autoMode && !cardDetected && (
                            <div className="absolute inset-0 overflow-hidden rounded-xl">
                                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 pb-4">
                <button
                    onClick={capture}
                    disabled={isCapturing}
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${cardDetected
                        ? 'border-green-400 hover:bg-green-400/20'
                        : 'border-white hover:bg-white/20'
                        } ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`w-12 h-12 rounded-full transition-colors duration-300 ${cardDetected ? 'bg-green-400' : 'bg-white'}`}></div>
                </button>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CameraCapture;
