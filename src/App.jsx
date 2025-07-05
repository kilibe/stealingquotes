import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import DeckList from './components/DeckList'
import DeckView from './components/DeckView'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [selectedDeck, setSelectedDeck] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="App">
      <h1>Flashcard App</h1>
      {user ? (
        <div>
          {selectedDeck ? (
            <DeckView 
              deck={selectedDeck} 
              onBack={() => setSelectedDeck(null)}
            />
          ) : (
            <>
              <div className="header">
                <p>Welcome, {user.email}!</p>
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
              <DeckList 
                user={user} 
                onSelectDeck={setSelectedDeck}
              />
            </>
          )}
        </div>
      ) : (
        <Auth />
      )}
    </div>
  )
}

export default App