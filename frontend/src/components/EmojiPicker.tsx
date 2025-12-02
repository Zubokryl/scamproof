'use client';

import { useState } from 'react';
import './EmojiPicker.css';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Professional business emojis
  const businessEmojis = [
    '👍', '👎', '👏', '🙏', '👌', '✍️', '✅', '⚠️',
    '💡', '🔍', '📊', '📈', '📉', '📌', '🔗', '📤',
    '📥', '📅', '⏰', '❗', '❓', '➕', '➖', '➗',
    '✖️', '✔️', '❌', '⭕', '💯', '🔑', '🔒', '🔓'
  ];

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false); // Close picker after selection
  };

  return (
    <div className="emoji-picker">
      <button 
        type="button"
        className="emoji-toggle-button"
        onClick={togglePicker}
        aria-label="Toggle emoji picker"
      >
        ↗️
      </button>
      
      {isOpen && (
        <div className="emoji-picker-dropdown">
          <div className="emoji-picker-content">
            {businessEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                className="emoji-button"
                onClick={() => handleEmojiClick(emoji)}
                aria-label={`Select ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;