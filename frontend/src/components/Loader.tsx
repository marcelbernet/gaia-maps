import React from 'react';

const Loader: React.FC = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(20,24,40,0.4)' }}>
    <div className="loader-star" />
  </div>
);

export default Loader; 