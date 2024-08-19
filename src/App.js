import React, { Suspense, lazy } from 'react';

// Map 컴포넌트를 지연 로딩
const Map = lazy(() => import('./components/Map'));

// 로딩 중에 표시할 컴포넌트
const Loading = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h2>지도를 불러오는 중입니다...</h2>
    {/* 필요하다면 여기에 로딩 스피너나 프로그레스 바를 추가할 수 있습니다 */}
  </div>
);

function App() {
  return (
    <div className="App">
      <h1>티오더 매장찾기</h1>
      <Suspense fallback={<Loading />}>
        <Map />
      </Suspense>
    </div>
  );
}

export default App;