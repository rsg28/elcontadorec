import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loadingAnimation2.json';

const LoadingAnimation = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: '200px',
        height: '75px',
        marginTop: '-200px'
      }}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;
