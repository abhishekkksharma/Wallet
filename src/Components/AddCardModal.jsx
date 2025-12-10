import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, FileImage, Upload, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addCard } from '../cards';
import { fetchFolders, addFolder } from '../folders';

const AddCardModal = ({ isOpen, onClose }) => {
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [isAddingFolder, setIsAddingFolder] = useState(false);

    const dispatch = useDispatch();
    const { items: folders } = useSelector((state) => state.folders);

    const frontInputRef = useRef(null);
    const backInputRef = useRef(null);

    // Fetch folders when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchFolders());
        }
    }, [isOpen, dispatch]);

    if (!isOpen) return null;

    const handleImageUpload = (e, side) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (side === 'front') setFrontImage(reader.result);
            else setBackImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let folderId = selectedFolderId;

            // If adding a new folder on the fly
            if (isAddingFolder && newFolderName.trim()) {
                const result = await dispatch(addFolder(newFolderName)).unwrap();
                folderId = result.id;
            }

            await dispatch(addCard({ frontImage, backImage, folderId })).unwrap();
            onClose();
            // Reset state
            setFrontImage(null);
            setBackImage(null);
            setSelectedFolderId('');
            setNewFolderName('');
            setIsAddingFolder(false);
        } catch (error) {
            alert('Failed to add card: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Add New Card</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Folder Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Folder</label>
                        {!isAddingFolder ? (
                            <div className="flex gap-2">
                                <select
                                    value={selectedFolderId}
                                    onChange={(e) => setSelectedFolderId(e.target.value)}
                                    className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="">Select a folder (or default)</option>
                                    {folders.map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setIsAddingFolder(true)}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Create New Folder"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="New Folder Name"
                                    className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsAddingFolder(false)}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Front Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Front Image</label>
                        <div
                            onClick={() => frontInputRef.current.click()}
                            className={`
                relative h-40 rounded-xl border-2 border-dashed border-gray-300 
                flex flex-col items-center justify-center cursor-pointer
                hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden
                ${frontImage ? 'border-solid border-blue-500' : ''}
              `}
                        >
                            {frontImage ? (
                                <img src={frontImage} alt="Front Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors mb-2">
                                        <FileImage className="text-gray-400 group-hover:text-blue-500" size={24} />
                                    </div>
                                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Click to upload front</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={frontInputRef}
                                onChange={(e) => handleImageUpload(e, 'front')}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Back Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Back Image</label>
                        <div
                            onClick={() => backInputRef.current.click()}
                            className={`
                relative h-40 rounded-xl border-2 border-dashed border-gray-300 
                flex flex-col items-center justify-center cursor-pointer
                hover:border-purple-500 hover:bg-purple-50 transition-all group overflow-hidden
                ${backImage ? 'border-solid border-purple-500' : ''}
              `}
                        >
                            {backImage ? (
                                <img src={backImage} alt="Back Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-purple-100 transition-colors mb-2">
                                        <Camera className="text-gray-400 group-hover:text-purple-500" size={24} />
                                    </div>
                                    <span className="text-sm text-gray-500 group-hover:text-purple-600">Click to upload back</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={backInputRef}
                                onChange={(e) => handleImageUpload(e, 'back')}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                    >
                        {loading ? 'Adding...' : (
                            <>
                                <Upload size={18} />
                                Add Card
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddCardModal;
