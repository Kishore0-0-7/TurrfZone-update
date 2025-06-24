import './Hero.css';

function Hero({ onScrollClick }: { onScrollClick: () => void }) {
  return (
    <div className="hero">
      {/* <div className="overlay"></div>
      <div className="innercontent">
        <div className="hero-text">
          <h1>
            G<span className="green">a</span>me On!
          </h1>
          <p><span className="green">A</span>nytime</p>
          <h2><span className="green">A</span>nywhere...</h2>
        </div>
        <div className="cta-button-wrapper">
          <button className="cta-button" onClick={onScrollClick}>
            Secure Your Spot
          </button>
        </div>
      </div> */}
    </div>
  );
}

export default Hero;