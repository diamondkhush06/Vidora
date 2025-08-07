// /landing.jsx
import React from "react";
import ParticleBackground from "../components/ParticleBackground";
import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="App">
      <header className="custom-header">
        <div className="logo-text">
          <i className="fa-solid fa-video"></i> Vidora
        </div>

        <div className="nav-links">
          <p className="nav-btn" onClick={() => router("/aljk23")}>Join as Guest</p>
          <p className="nav-btn" onClick={() => router("/auth")}>Register</p>
          <p className="nav-btn" onClick={() => router("/auth")}>Login</p>
        </div>
      </header>

      <ParticleBackground />

      <div className="overlay-content">
        {/* ✅ Neon Welcome Text Above Typewriter */}
        <div className="neon-container">
          <h1 className="neon-text">Welcome to Vidora</h1>
        </div>

        <div className="hero-bottom">
          <p className="cursor typewriter-animation">Your portal to seamless video communication....</p>
          <p className="cursor typewriter-animation">Crystal-clear calls & chats, wherever you are....</p>
          <p className="cursor typewriter-animation">Simple. Fast. Reliable.....</p>
        </div>

        {/* Bottom Right Get Started */}
        <div
          className="get-started"
          onClick={() => router("/auth")}
          role="button"
        >
          <i className="fas fa-angle-double-left"></i>
          Get Started
          <i className="fas fa-angle-double-right"></i>
        </div>
      </div>
    </div>
  );
}
