import React from 'react';

const popupStyle = {
  position: 'absolute',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  padding: '15px',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  zIndex: 1000,
  maxWidth: '300px',
  fontFamily: 'Arial, sans-serif',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#888',
  transition: 'color 0.3s',
};

const titleStyle = {
  marginTop: '0',
  marginBottom: '10px',
  color: '#333',
};

const contentStyle = {
  marginBottom: '5px',
  color: '#666',
};

const StorePopup = ({ store, position, onClose }) => {
  return (
      <div style={{...popupStyle, left: position.x, top: position.y}}>
          <button
              style={closeButtonStyle}
              onClick={onClose}
              onMouseOver={(e) => e.target.style.color = '#333'}
              onMouseOut={(e) => e.target.style.color = '#888'}
          >
              ×
          </button>
          <h3 style={titleStyle}>{store.name}</h3>
          <p style={contentStyle}>{store.type || ''}</p>
          <p style={contentStyle}>{store.addr || 'Address not available'}</p>
          <p style={contentStyle}>Distance: {store.distance.toFixed(2)} meters</p>
      </div>
  );
};

export default StorePopup;