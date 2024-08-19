import React, { useState } from 'react';

const storeListStyle = {
  width: '550px',
  height: '100%',
  overflowY: 'auto',
  padding: '20px',
  boxSizing: 'border-box',
  backgroundColor: '#f0f0f0',
};

const buttonStyle = {
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  width: '100%', // 버튼을 전체 너비로 설정
};

const sortButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#008CBA',
};

const storeItemStyle = {
  marginBottom: '10px',
  borderBottom: '1px solid #ddd',
  paddingBottom: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

const StoreList = ({ stores, onStoreSelect, onReturnToCurrentLocation }) => {
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedStores = [...stores].sort((a, b) => {
    return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
  });

  return (
    <div style={storeListStyle}>
      <h2>가까운 티오더 매장</h2>
      <button style={buttonStyle} onClick={onReturnToCurrentLocation}>
        현재 위치로 돌아가기
      </button>
      <button style={sortButtonStyle} onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        {sortOrder === 'asc' ? '거리순 정렬 (오름차순)' : '거리순 정렬 (내림차순)'}
      </button>
      <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
        {sortedStores.map(store => (
            <li
                key={store._id}
                style={storeItemStyle}
                onClick={() => onStoreSelect(store)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <h3>{store.name}</h3>
              <p>{store.type}</p>
              <p>{store.addr}</p>
              <p>거리: {store.distance.toFixed(2)} 미터</p>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreList;