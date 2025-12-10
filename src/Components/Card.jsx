import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Plus, Trash2, FileImage } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCard, deleteCard } from '../cards';

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
    <div className="card-wrapper">
      {/* Embedded CSS for single-file portability */}
      <style>{`
        :root {
          --card-width: 350px;
          --card-height: 220px;
          --primary-color: #3b82f6;
          --bg-color: #f3f4f6;
          --text-color: #1f2937;
          --fab-size: 48px;
        }

        .card-wrapper {
          position: relative;
          margin: 20px;
        }

        /* --- 3D SCENE & CARD STYLES --- */
        .scene {
          width: var(--card-width);
          height: var(--card-height);
          perspective: 1000px;
          cursor: pointer;
          z-index: 10;
        }

        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
          border-radius: 16px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.2);
        }

        .card.is-flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .card-front {
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          z-index: 2;
        }

        .card-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #9ca3af;
          text-align: center;
          padding: 20px;
        }

        .placeholder p {
          margin-top: 10px;
          font-size: 0.9rem;
        }

        /* --- FAB (Floating Action Button) STYLES --- */
        .fab-container {
          position: absolute;
          bottom: -20px;
          right: -20px;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          gap: 10px;
          z-index: 50;
        }

        .fab-main {
          width: var(--fab-size);
          height: var(--fab-size);
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .fab-main:hover {
          transform: scale(1.1);
        }

        .fab-main.open {
          transform: rotate(45deg);
          background-color: #ef4444; /* Red when open/close action */
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .fab-menu {
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
          align-items: flex-end;
          margin-bottom: 5px;
        }

        .fab-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transform: translateY(20px) scale(0.8);
          animation: slideUp 0.3s forwards;
        }

        .fab-item-row:nth-child(1) { animation-delay: 0.05s; }
        .fab-item-row:nth-child(2) { animation-delay: 0.1s; }
        .fab-item-row:nth-child(3) { animation-delay: 0.15s; }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .fab-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }

        .fab-btn:hover {
          transform: scale(1.1);
        }

        .btn-front { background-color: #10b981; }
        .btn-back { background-color: #8b5cf6; }
        .btn-delete { background-color: #ef4444; }

        .fab-label {
          background: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          pointer-events: none;
          white-space: nowrap;
        }

        .hidden-input {
          display: none;
        }

        /* --- RESPONSIVE SCALING --- */
        @media (max-width: 400px) {
          .scene {
            width: 80vw;
            height: calc(80vw * 0.63);
          }
        }
      `}</style>

      {/* 3D Scene Container */}
      <div className="scene" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>

          {/* Front Face */}
          <div className="card-face card-front">
            {frontImage ? (
              <img src={frontImage} alt="Front" className="card-image" />
            ) : (
              <div className="placeholder">
                <ImageIcon size={48} />
                <p>Front Side</p>
              </div>
            )}
          </div>

          {/* Back Face */}
          <div className="card-face card-back">
            {backImage ? (
              <img src={backImage} alt="Back" className="card-image" />
            ) : (
              <div className="placeholder">
                <Camera size={48} />
                <p>Back Side</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Action Button Menu */}
      <div className="fab-container">

        {isMenuOpen && (
          <div className="fab-menu">

            {/* Delete Option */}
            <div className="fab-item-row">
              <span className="fab-label">Delete</span>
              <button className="fab-btn btn-delete" onClick={handleDelete}>
                <Trash2 size={18} />
              </button>
            </div>

            {/* Back Image Option */}
            <div className="fab-item-row">
              <span className="fab-label">Back</span>
              <button className="fab-btn btn-back" onClick={() => triggerUpload(backInputRef)}>
                <Camera size={18} />
              </button>
            </div>

            {/* Front Image Option */}
            <div className="fab-item-row">
              <span className="fab-label">Front</span>
              <button className="fab-btn btn-front" onClick={() => triggerUpload(frontInputRef)}>
                <FileImage size={18} />
              </button>
            </div>

          </div>
        )}

        {/* Main Toggle Button */}
        <button
          className={`fab-main ${isMenuOpen ? 'open' : ''}`}
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
        className="hidden-input"
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={(e) => handleImageUpload(e, 'back')}
        accept="image/*"
        className="hidden-input"
      />

    </div>
  );
};

export default FlipCard;