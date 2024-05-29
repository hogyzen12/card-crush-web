import { useRoutes } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { HowToPlay } from './HowToPlay';
import { GameScreen } from './GameScreen';
import { LeaderboardScreen } from './LeaderboardScreen';

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <HomeScreen /> },
    { path: '/home', element: <HomeScreen /> },
    { path: '/how-to-play', element: <HowToPlay />},
    { path: '/game', element: <GameScreen /> },
    { path: '/leaderboard', element: <LeaderboardScreen /> }
  ]);
}