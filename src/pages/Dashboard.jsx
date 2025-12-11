import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../store/cards';
import { fetchFolders, addFolder } from '../store/folders';
import Navbar from '../Components/Navbar';
import FlipCard from '../Components/Card';
import AddCardModal from '../Components/AddCardModal';
import Folder from '../Components/Folder';
import { Plus, ArrowLeft } from 'lucide-react';
import Loader from '../Components/Loader';

const Dashboard = () => {
    const dispatch = useDispatch()
    const { items: cardsByFolder = {}, status: cardStatus = 'idle' } = useSelector((state) => state.cards || {})
    const { items: folders = [], status: folderStatus = 'idle', ownerId: folderOwnerId = null } = useSelector((state) => state.folders || {})
    const { user } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentFolder, setCurrentFolder] = useState(null) // null = root (folders view), object = specific folder

    // Derived state for current folder's cards
    const cards = currentFolder ? (cardsByFolder[currentFolder.id] || []) : []

    useEffect(() => {
        // Debug Logging
        console.log('Dashboard Effect:', { user: user?.id, folderStatus, folderOwnerId, foldersLen: folders.length });

        // If we have a user and folder data, but the owner doesn't match, refetch
        if (user && folderOwnerId && user.id !== folderOwnerId) {
            console.log('Owner mismatch, refetching...');
            dispatch(fetchFolders(user.id))
            return
        }

        if (folderStatus === 'idle' && user) {
            console.log('Status idle, fetching...');
            dispatch(fetchFolders(user.id))
        }
    }, [folderStatus, dispatch, user, folderOwnerId])

    // Cards fetch effect - MUST be before any early returns (React Rules of Hooks)
    useEffect(() => {
        if (currentFolder) {
            // Only fetch if we don't have cards for this folder yet
            if (!cardsByFolder[currentFolder.id]) {
                dispatch(fetchCards(currentFolder.id))
            }
        }
    }, [currentFolder, dispatch, cardsByFolder])

    // Prevent showing stale data if ownership mismatch
    if (user && folderOwnerId && user.id !== folderOwnerId) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-black">
                <Loader size="large" />
            </div>
        )
    }

    // Show loader only while actively fetching folders
    if (folderStatus === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-black">
                <Loader size="large" />
            </div>
        )
    }

    const handleAddCard = () => {
        setIsModalOpen(true)
    }

    const handleFolderClick = (folder) => {
        setCurrentFolder(folder)
    }

    const handleBack = () => {
        setCurrentFolder(null)
    }

    const handleAddFolder = async () => {
        const name = prompt("Enter folder name:")
        if (name) {
            await dispatch(addFolder(name))
        }
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen dark:bg-black dark:text-white lg:m-10 pt-24 px-8 pb-12'>

                {/* Header Section */}
                <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {currentFolder && (
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-8xl mx-auto">

                    {/* Folders Grid (Root View) */}
                    {!currentFolder && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 justify-items-center">
                            {folders.map((folder) => (
                                <Folder
                                    key={folder.id}
                                    name={folder.name}
                                    onClick={() => handleFolderClick(folder)}
                                />
                            ))}

                            {folders.length === 0 && folderStatus === 'succeeded' && (
                                <div className="col-span-full flex flex-col items-center justify-center text-gray-500 mt-20">
                                    <p className="text-xl">No folders yet.</p>
                                    <p>Create a folder or add a card to get started.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cards Grid (Folder View) */}
                    {currentFolder && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                            {cards.map((card) => (
                                <FlipCard
                                    key={card.id}
                                    id={card.id}
                                    frontImage={card.front_image}
                                    backImage={card.back_image}
                                />
                            ))}

                            {cards.length === 0 && cardStatus === 'succeeded' && (
                                <div className="col-span-full flex flex-col items-center justify-center text-gray-500 mt-20">
                                    <p className="text-xl">No cards in this folder.</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {cardStatus === 'loading' && (
                                <div className="col-span-full flex justify-center mt-20">
                                    <Loader size="large" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Floating Action Button (Only in Folder View or if we want global add) */}
                <button
                    onClick={currentFolder ? handleAddCard : handleAddFolder}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
                >
                    <Plus size={32} />
                </button>

                {/* Add Card Modal */}
                <AddCardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    defaultFolderId={currentFolder?.id}
                />
            </div>
        </>
    )
}

export default Dashboard;
