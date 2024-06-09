import React from 'react';

const candyImages = [
  "assets/newcards/air.PNG",
  "assets/newcards/bck.PNG",
  "assets/newcards/bnk.PNG",
  "assets/newcards/fre.PNG",
  "assets/newcards/inu.PNG",
  "assets/newcards/jls.PNG",
  "assets/newcards/jto.PNG",
  "assets/newcards/nyl.PNG",
  "assets/newcards/ott.PNG",
  "assets/newcards/thn.PNG",
  "assets/newcards/tts.PNG",
  "assets/newcards/unr.PNG",
  "assets/newcards/wtr.PNG"
];

const matchGif = "assets/animations/burn.gif";
const catGif = "assets/CAT.gif";
const successGif = "assets/SUCCESS.gif";
const bonkPNG = "assets/BONKlogo.png";

export function HowToPlay() {
  return (
    <div className="how-to-play">      
      <section className="instructions">
        <div className="instruction-item">
          <img src={matchGif} alt="Match Cards" />
          <div>
            <h2>Match Cards</h2>
            <p>Combine three or more cards of the same type in a row or column to crush them and get a point per card crushed. Special cards can be matched, and when crushed apply special rules as shown below!</p>
          </div>
        </div>

        <div className="instruction-item">
          <img src={catGif} alt="Submit Scores" />
          <div>
            <h2>Submit Scores</h2>
            <p>Submit your scores on-chain to get rewarded with BONK. Rewards distributed directly to your entry wallet. The BONKATHON game will run until the end of the hackathon - expected to be the 10th of July.</p>
          </div>
        </div>

        <div className="instruction-item">
          <img src={successGif} alt="Daily Play & Streak Mechanic" />
          <div>
            <h2>Daily Play & Streak Mechanic</h2>
            <p>A new initial board goes live every day at midnight (00:00 UTC). Show up daily to build a streak. Compete daily to get the most points, highest streak, and the most BONK in rewards!</p>
          </div>
        </div>

        <div className="instruction-item">
          <img src={bonkPNG} alt="BONK Rewards" />
          <div>
            <h2>BONK Rewards</h2>
            <p>We have purchased 100 Million BONK to reward players. Rewards are based on the formula:</p>
            <p><strong>BONK received = total points × streak.</strong></p>
          </div>
        </div>
      </section>

      <section className="special-cards">
        <h2>Special Cards</h2>
        <div className="special-card">
          <img src={candyImages[2]} alt="Bonk Card" />
          <div>
            <h3>Bonk Card</h3>
            <p>Crushes a whole row or column.</p>
          </div>
        </div>
        <div className="special-card">
          <img src={candyImages[6]} alt="Jito Card" />
          <div>
            <h3>Jito Card</h3>
            <p>Grants an extra turn.</p>
          </div>
        </div>
        <div className="special-card">
          <img src={candyImages[9]} alt="Electric Card" />
          <div>
            <h3>Electric Card</h3>
            <p>Crushes all electric cards it can touch.</p>
          </div>
        </div>
        <div className="special-card">
          <img src={candyImages[12]} alt="Water Card" />
          <div>
            <h3>Water Card</h3>
            <p>Flows downwards crushing water cards.</p>
          </div>
        </div>
        <div className="special-card">
          <img src={candyImages[0]} alt="Air Card" />
          <div>
            <h3>Air Card</h3>
            <p>Flows upwards crushing air cards.</p>
          </div>
        </div>
        <div className="special-card">
          <img src={candyImages[3]} alt="Fire Card" />
          <div>
            <h3>Fire Card</h3>
            <p>Crushes surrounding cards 1 grid position away.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

