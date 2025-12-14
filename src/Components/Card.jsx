import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Pencil, Trash2, FileImage, X, Download } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCard, deleteCard } from '../store/cards';
import CameraCapture from './CameraCapture';
import Popup from './Popup';
import { jsPDF } from 'jspdf';

const FlipCard = ({ id, frontImage, backImage }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(null); // 'front' | 'back' | null
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dispatch = useDispatch();

  // Refs for hidden file inputs
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Handle Image Upload & Conversion to Base64
  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updates = side === 'front' ? { front_image: base64String } : { back_image: base64String };

      dispatch(updateCard({ id, updates }));

      if (side === 'front') {
        if (isFlipped) setIsFlipped(false);
      } else {
        if (!isFlipped) setIsFlipped(true);
      }
      setIsMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Camera Capture
  const handleCameraCapture = (base64Image) => {
    const updates = cameraMode === 'front' ? { front_image: base64Image } : { back_image: base64Image };
    dispatch(updateCard({ id, updates }));

    if (cameraMode === 'front') {
      if (isFlipped) setIsFlipped(false);
    } else {
      if (!isFlipped) setIsFlipped(true);
    }
    setCameraMode(null);
    setIsMenuOpen(false);
  };

  // Delete Card
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    dispatch(deleteCard(id));
    setShowDeleteConfirm(false);
  };

  // Download Card as PDF
  const handleDownloadPDF = () => {
    if (!frontImage && !backImage) {
      return; // Nothing to download
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5' // Smaller format, good for card-sized images
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = pageHeight - (margin * 2);

    // Add front image on page 1
    if (frontImage) {
      pdf.text('Front', pageWidth / 2, 8, { align: 'center' });
      pdf.addImage(frontImage, 'JPEG', margin, margin, imgWidth, imgHeight);
    }

    // Add back image on page 2
    if (backImage) {
      if (frontImage) {
        pdf.addPage();
      }
      pdf.text('Back', pageWidth / 2, 8, { align: 'center' });
      pdf.addImage(backImage, 'JPEG', margin, margin, imgWidth, imgHeight);
    }

    // Download the PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`card-${timestamp}.pdf`);
    setIsMenuOpen(false);
  };

  // Trigger File Input Click
  const triggerUpload = (ref) => {
    ref.current.click();
  };

  return (
    <div className="relative m-5">

      {/* 3D Scene Container */}
      <div
        className="w-[350px] h-[220px] max-w-[80vw] max-h-[calc(80vw*0.63)] cursor-pointer z-10"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="w-full h-full relative rounded-2xl shadow-xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >

          {/* Front Face */}
          <div
            className="absolute w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-black z-[2]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {frontImage ? (
              <img src={frontImage} alt="Front" className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 text-center p-5">
                <ImageIcon size={48} />
                <p className="mt-2 text-sm">Front Side</p>
              </div>
            )}
          </div>

          {/* Back Face */}
          <div
            className="absolute w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-900"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {backImage ? (
              <img src={backImage} alt="Back" className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 text-center p-5">
                <Camera size={48} />
                <p className="mt-2 text-sm">Back Side</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Action Button Menu */}
      <div className="absolute -bottom-5 -right-5 flex flex-col-reverse items-center gap-2.5 z-30">

        {isMenuOpen && (
          <div className="flex flex-col-reverse gap-2.5 items-end mb-1.5">

            {/* Delete Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-250">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Delete</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Download PDF Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-200">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Download PDF</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={handleDownloadPDF}
                disabled={!frontImage && !backImage}
              >
                <Download size={18} />
              </button>
            </div>

            {/* Back Camera Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-150">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Back (Camera)</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={() => setCameraMode('back')}
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Back File Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-100">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Back (File)</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={() => triggerUpload(backInputRef)}
              >
                <FileImage size={18} />
              </button>
            </div>

            {/* Front Camera Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-75">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Front (Camera)</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={() => setCameraMode('front')}
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Front File Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Front (File)</span>
              <button
                className="w-10 h-10 rounded-full border-none text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
                onClick={() => triggerUpload(frontInputRef)}
              >
                <FileImage size={18} />
              </button>
            </div>

          </div>
        )}

        {/* Main Toggle Button - Pencil Icon */}
        <button
          className={`
            w-12 h-12 rounded-full border-none shadow-lg cursor-pointer flex items-center justify-center 
            transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-110
            ${isMenuOpen
              ? 'rotate-90 bg-gray-400/80 dark:bg-gray-600/80 text-gray-700 dark:text-gray-200 shadow-gray-400/40'
              : 'bg-gray-200/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 shadow-gray-300/40 dark:shadow-gray-600/40'
            }
            backdrop-blur-sm
          `}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          {isMenuOpen ? <X size={24} /> : <Pencil size={20} />}
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={frontInputRef}
        onChange={(e) => handleImageUpload(e, 'front')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={(e) => handleImageUpload(e, 'back')}
        accept="image/*"
        className="hidden"
      />

      {/* Camera Capture Modal */}
      {cameraMode && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setCameraMode(null)}
        />
      )}

      {/* Delete Confirmation Popup */}
      <Popup
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  );
};

export default FlipCard;