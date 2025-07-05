import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function DeckView({ deck, onBack }) {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [deck.id])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deck.id)
        .order('created_at')

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error loading cards:', error)
      alert('Error loading cards!')
    } finally {
      setLoading(false)
    }
  }

  const nextCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  if (loading) return <div>Loading cards...</div>
  if (cards.length === 0) return (
    <div>
      <button onClick={onBack}>← Back to Decks</button>
      <p>No cards in this deck yet!</p>
    </div>
  )

  const currentCard = cards[currentIndex]

  return (
    <div className="deck-view">
      <div className="deck-header">
        <button onClick={onBack}>← Back to Decks</button>
        <h2>{deck.name}</h2>
        <span>{currentIndex + 1} / {cards.length}</span>
      </div>

      <div className="flashcard-container">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={flipCard}
        >
          <div className="flashcard-front">
            {currentCard.front_image_url ? (
              <img 
                src={currentCard.front_image_url} 
                alt="Question"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            ) : (
              <div className="text-content">
                {currentCard.front_text || 'No question'}
              </div>
            )}
          </div>
          <div className="flashcard-back">
            {currentCard.back_image_url ? (
              <img 
                src={currentCard.back_image_url} 
                alt="Answer"
              />
            ) : (
              <div className="text-content">
                {currentCard.back_text || 'No answer'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-controls">
        <button onClick={prevCard} disabled={cards.length <= 1}>
          ← Previous
        </button>
        <button onClick={flipCard} className="flip-button">
          Flip Card
        </button>
        <button onClick={nextCard} disabled={cards.length <= 1}>
          Next →
        </button>
      </div>
    </div>
  )
}