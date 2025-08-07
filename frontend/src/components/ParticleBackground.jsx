import React from "react";
import "./ParticleBackground.scss";

const ParticleBackground = () => {
  const particles = Array.from({ length: 40 }); // fewer particles for subtle look

  return (
    <div className="container">
      <img src="/jannu.png" className="background" alt="bg" />

      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const size = Math.random() * 6 + 4; // subtle sizing
        const delay = Math.random() * 10;
        const duration = Math.random() * 5 + 5; 
        const offsetX = Math.random() * 40 - 20; // left-right drift

        return (
          <div
            key={i}
            className="circle-container"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `translateX(${offsetX}px)`,
            }}
          >
            <div className="circle"></div>
          </div>
        );
      })}
    </div>
  );
};

export default ParticleBackground;
