import { useRoutes } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <HomeScreen /> },
    { path: '/home', element: <HomeScreen /> },
    { path: '/game', element: <GameScreen /> },
  ]);
}