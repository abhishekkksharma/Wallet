import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCards, addCard } from './cards'
import './App.css'
import Navbar from './Components/Navbar'
import FlipCard from './Components/Card'
import Login from './Components/Login'
import AddCardModal from './Components/AddCardModal'
import Folder from './Components/Folder'
import { Plus, ArrowLeft } from 'lucide-react'
import { fetchFolders, addFolder } from './folders'

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { items: cards = [], status: cardStatus = 'idle' } = useSelector((state) => state.cards || {})
  const { items: folders = [], status: folderStatus = 'idle' } = useSelector((state) => state.folders || {})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState(null) // null = root (folders view), object = specific folder

  useEffect(() => {
    if (folderStatus === 'idle') {
      dispatch(fetchFolders())
    }
  }, [folderStatus, dispatch])

  useEffect(() => {
    if (currentFolder) {
      dispatch(fetchCards(currentFolder.id))
    }
  }, [currentFolder, dispatch])

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
      <div className='min-h-screen bg-gray-100 pt-24 px-4 pb-12'>

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
            <h1 className="text-3xl font-bold text-gray-800">
              {currentFolder ? currentFolder.name : 'My Folders'}
            </h1>
          </div>

          {!currentFolder && (
            <h2 className="text-xl text-gray-500 font-medium">Select a folder</h2>
          )}
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">

          {/* Folders Grid (Root View) */}
          {!currentFolder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
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
                  <p className="text-gray-500">Loading cards...</p>
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
        />
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
