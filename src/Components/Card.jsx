import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Plus, Trash2, FileImage } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCard, deleteCard } from '../store/cards';

const FlipCard = ({ id, frontImage, backImage }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        if (isFlipped) setIsFlipped(false); // Show front
      } else {
        if (!isFlipped) setIsFlipped(true); // Show back
      }
      setIsMenuOpen(false); // Close menu after selection
    };
    reader.readAsDataURL(file);
  };

  // Delete Card
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      dispatch(deleteCard(id));
    }
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
      <div className="absolute -bottom-5 -right-5 flex flex-col-reverse items-center gap-2.5 z-50">

        {isMenuOpen && (
          <div className="flex flex-col-reverse gap-2.5 items-end mb-1.5">

            {/* Delete Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-150">
              <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Delete</span>
              <button
                className="w-10 h-10 rounded-full border-none text-white cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-red-500"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Back Image Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-100">
              <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Back</span>
              <button
                className="w-10 h-10 rounded-full border-none text-white cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-violet-500"
                onClick={() => triggerUpload(backInputRef)}
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Front Image Option */}
            <div className="flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 delay-75">
              <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm pointer-events-none whitespace-nowrap">Front</span>
              <button
                className="w-10 h-10 rounded-full border-none text-white cursor-pointer flex items-center justify-center shadow-md transition-transform hover:scale-110 bg-emerald-500"
                onClick={() => triggerUpload(frontInputRef)}
              >
                <FileImage size={18} />
              </button>
            </div>

          </div>
        )}

        {/* Main Toggle Button */}
        <button
          className={`
            w-12 h-12 rounded-full text-white border-none shadow-lg cursor-pointer flex items-center justify-center 
            transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-110
            ${isMenuOpen ? 'rotate-45 bg-red-500 shadow-red-500/40' : 'bg-blue-500 shadow-blue-500/40'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <Plus size={24} />
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

    </div >
  );
};

export default FlipCard;