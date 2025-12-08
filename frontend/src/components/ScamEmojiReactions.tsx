import React, { useState } from 'react';

interface ScamEmojiReactionsProps {
  likes_count: number;
  user_has_liked: boolean;
  onLike: () => void;
}

const ScamEmojiReactions: React.FC<ScamEmojiReactionsProps> = ({ likes_count, user_has_liked, onLike }) => {
  // Track which reactions the user has selected
  const [userReactions, setUserReactions] = useState({
    thumbsUp: false,
    thumbsDown: false,
    heart: false
  });
  
  // Track local counts for each reaction
  const [localCounts, setLocalCounts] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
    heart: 0
  });
  
  const handleThumbsUp = () => {
    // If user already reacted with thumbs up, remove reaction
    if (userReactions.thumbsUp) {
      setUserReactions(prev => ({ ...prev, thumbsUp: false }));
      setLocalCounts(prev => ({ ...prev, thumbsUp: Math.max(0, prev.thumbsUp - 1) }));
      // Note: We don't call onLike here because we're just updating local state
    } else {
      // Check if user has any other reaction, if so, remove it first
      let newReactions = { ...userReactions, thumbsUp: true };
      let newCounts = { ...localCounts, thumbsUp: localCounts.thumbsUp + 1 };
      
      if (userReactions.thumbsDown) {
        newReactions.thumbsDown = false;
        newCounts.thumbsDown = Math.max(0, localCounts.thumbsDown - 1);
      }
      
      if (userReactions.heart) {
        newReactions.heart = false;
        newCounts.heart = Math.max(0, localCounts.heart - 1);
      }
      
      setUserReactions(newReactions);
      setLocalCounts(newCounts);
      onLike(); // Call onLike only when adding a new reaction
    }
  };
  
  const handleThumbsDown = () => {
    // If user already reacted with thumbs down, remove reaction
    if (userReactions.thumbsDown) {
      setUserReactions(prev => ({ ...prev, thumbsDown: false }));
      setLocalCounts(prev => ({ ...prev, thumbsDown: Math.max(0, prev.thumbsDown - 1) }));
      // Note: We don't call onLike here because we're just updating local state
    } else {
      // Check if user has any other reaction, if so, remove it first
      let newReactions = { ...userReactions, thumbsDown: true };
      let newCounts = { ...localCounts, thumbsDown: localCounts.thumbsDown + 1 };
      
      if (userReactions.thumbsUp) {
        newReactions.thumbsUp = false;
        newCounts.thumbsUp = Math.max(0, localCounts.thumbsUp - 1);
      }
      
      if (userReactions.heart) {
        newReactions.heart = false;
        newCounts.heart = Math.max(0, localCounts.heart - 1);
      }
      
      setUserReactions(newReactions);
      setLocalCounts(newCounts);
      onLike(); // Call onLike only when adding a new reaction
    }
  };
  
  const handleHeart = () => {
    // If user already reacted with heart, remove reaction
    if (userReactions.heart) {
      setUserReactions(prev => ({ ...prev, heart: false }));
      setLocalCounts(prev => ({ ...prev, heart: Math.max(0, prev.heart - 1) }));
      // Note: We don't call onLike here because we're just updating local state
    } else {
      // Check if user has any other reaction, if so, remove it first
      let newReactions = { ...userReactions, heart: true };
      let newCounts = { ...localCounts, heart: localCounts.heart + 1 };
      
      if (userReactions.thumbsUp) {
        newReactions.thumbsUp = false;
        newCounts.thumbsUp = Math.max(0, localCounts.thumbsUp - 1);
      }
      
      if (userReactions.thumbsDown) {
        newReactions.thumbsDown = false;
        newCounts.thumbsDown = Math.max(0, localCounts.thumbsDown - 1);
      }
      
      setUserReactions(newReactions);
      setLocalCounts(newCounts);
      onLike(); // Call onLike only when adding a new reaction
    }
  };
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Show all three emojis side by side with individual counters */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {/* Thumbs Up */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            onClick={handleThumbsUp}
            title="Нравится"
            style={{ 
              background: userReactions.thumbsUp ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: userReactions.thumbsUp ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              if (!userReactions.thumbsUp) {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(55, 65, 81, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!userReactions.thumbsUp) {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <div 
              style={{ 
                width: '24px', 
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span 
                style={{ 
                  fontSize: '20px'
                }}
              >
                👍
              </span>
            </div>
          </button>
          
          <span 
            style={{ 
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              minWidth: '16px',
              textAlign: 'center'
            }}
          >
            {localCounts.thumbsUp}
          </span>
        </div>
        
        {/* Thumbs Down */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            onClick={handleThumbsDown}
            title="Не нравится"
            style={{ 
              background: userReactions.thumbsDown ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: userReactions.thumbsDown ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              if (!userReactions.thumbsDown) {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(55, 65, 81, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!userReactions.thumbsDown) {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <div 
              style={{ 
                width: '24px', 
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span 
                style={{ 
                  fontSize: '20px'
                }}
              >
                👎
              </span>
            </div>
          </button>
          
          <span 
            style={{ 
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              minWidth: '16px',
              textAlign: 'center'
            }}
          >
            {localCounts.thumbsDown}
          </span>
        </div>
        
        {/* Heart */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            onClick={handleHeart}
            title="Люблю"
            style={{ 
              background: userReactions.heart ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: userReactions.heart ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              if (!userReactions.heart) {
                (e.target as HTMLElement).style.backgroundColor = 'rgba(55, 65, 81, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!userReactions.heart) {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <div 
              style={{ 
                width: '24px', 
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span 
                style={{ 
                  fontSize: '20px'
                }}
              >
                ❤️
              </span>
            </div>
          </button>
          
          <span 
            style={{ 
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              minWidth: '16px',
              textAlign: 'center'
            }}
          >
            {localCounts.heart}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScamEmojiReactions;