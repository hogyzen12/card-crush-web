// src/app/IntegratedTerminal.tsx

import React, { useEffect } from 'react';

const IntegratedTerminal = () => {
  useEffect(() => {
    window.Jupiter.init({
      displayMode: "integrated",
      integratedTargetId: "integrated-terminal",
      endpoint: "https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/",
      formProps: {
        fixedOutputMint: true,
        initialOutputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      },
    });
  }, []);

  return <div id="integrated-terminal" style={{ width: "100%", height: "100vh" }}></div>;
};

export default IntegratedTerminal;
