import { useRoutes } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { HowToPlay } from './HowToPlay';
import { GameScreen } from './GameScreen';
import { BonkGameScreen } from './BonkGameScreen';
import { LeaderboardScreen } from './LeaderboardScreen';

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <HomeScreen /> },
    { path: '/home', element: <HomeScreen /> },
    { path: '/how-to-play', element: <HowToPlay />},
    { path: '/game', element: <GameScreen /> },
    { path: '/bonkgame', element: <BonkGameScreen /> },
    { path: '/leaderboard', element: <LeaderboardScreen /> }
  ]);
}