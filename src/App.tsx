import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import OriginFlightsPage from './pages/OriginFlightsPage';
import RouteFlightsPage from './pages/RouteFlightsPage';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:slug" element={<SlugRouter />} />
      </Routes>
    </BrowserRouter>
  );
};

// SlugRouter handles both origin and route slugs
import { useParams, Navigate } from 'react-router-dom';

function SlugRouter() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  // Pattern: toronto-to-lisbon-flights (route page)
  const routeMatch = slug.match(/^([a-z]+)-to-([a-z]+)-flights$/i);
  if (routeMatch) {
    return <RouteFlightsPage origin={routeMatch[1]} destination={routeMatch[2]} />;
  }

  // Pattern: toronto-flights (origin page)
  const originMatch = slug.match(/^([a-z]+)-flights$/i);
  if (originMatch) {
    return <OriginFlightsPage origin={originMatch[1]} />;
  }

  // Unknown pattern - redirect home
  return <Navigate to="/" replace />;
}

export default App;
