import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function DeckList({ user, onSelectDeck }) {  // Add onSelectDeck prop
  const [decks, setDecks] = useState([])
  const [newDeckName, setNewDeckName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      // Fetch all decks (user's and public)
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Mark which decks belong to the user
      const decksWithOwnership = (data || []).map(deck => ({
        ...deck,
        isPersonal: deck.user_id === user.id
      }))
      
      setDecks(decksWithOwnership)
    } catch (error) {
      alert('Error loading decks!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createDeck = async (e) => {
    e.preventDefault()
    if (!newDeckName.trim()) return

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([
          { 
            name: newDeckName,
            user_id: user.id 
          }
        ])
        .select()

      if (error) throw error
      
      setDecks([{...data[0], isPersonal: true}, ...decks])
      setNewDeckName('')
    } catch (error) {
      alert('Error creating deck!')
      console.error(error)
    }
  }

  const deleteDeck = async (id) => {
    if (!confirm('Delete this deck and all its cards?')) return

    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setDecks(decks.filter(deck => deck.id !== id))
    } catch (error) {
      alert('Error deleting deck!')
      console.error(error)
    }
  }

  if (loading) return <div>Loading decks...</div>

  return (
    <div className="deck-list">
      <h2>My Decks</h2>
      
      <form onSubmit={createDeck} className="create-deck-form">
        <input
          type="text"
          placeholder="New deck name..."
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
        />
        <button type="submit">Create Deck</button>
      </form>

      <div className="decks-grid">
        {decks.length === 0 ? (
          <p>No decks yet. Create your first deck!</p>
        ) : (
          decks.map(deck => (
            <div key={deck.id} className="deck-card">
              <h3>
                {deck.name} 
                {!deck.isPersonal && <span className="public-badge">Public</span>}
              </h3>
              <p>{deck.description || 'No description'}</p>
              <div className="deck-actions">
                <button onClick={() => onSelectDeck(deck)}>
                  Study
                </button>
                {deck.isPersonal && (
                  <button onClick={() => deleteDeck(deck.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}