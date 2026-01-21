import { Link } from 'react-router-dom';
import deals from '../data/deals.json';
import DealCard from '../components/DealCard';

interface OriginFlightsPageProps {
  origin: string;
}

// Map city names to codes for display
const cityNames: Record<string, string> = {
  yyz: 'Toronto',
  yvr: 'Vancouver',
  yul: 'Montreal',
  yyc: 'Calgary',
};

export default function OriginFlightsPage({ origin }: OriginFlightsPageProps) {
  const originUpper = origin.toUpperCase();
  const cityName = cityNames[origin.toLowerCase()] || originUpper;

  const filtered = deals.filter(d => d.origin_code === originUpper);

  // Get unique destinations for this origin
  const destinations = [...new Set(filtered.map(d => ({
    code: d.destination_code,
    name: d.destination,
  })))];

  return (
    <div className="bfd-app">
      <header className="bfd-header">
        <Link to="/" className="back-link">&larr; All Deals</Link>
        <h1>{cityName} Flights</h1>
        <p className="subtitle">Cheap flights departing {cityName} ({originUpper}).</p>
      </header>

      {destinations.length > 0 && (
        <nav className="bfd-nav">
          <p className="nav-label">Filter by destination:</p>
          <div className="nav-links">
            {destinations.map(dest => (
              <Link
                key={dest.code}
                to={`/${origin.toLowerCase()}-to-${dest.name.toLowerCase().replace(/\s+/g, '-')}-flights`}
                className="nav-link"
              >
                {dest.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <main className="bfd-main">
        <section className="bfd-results">
          <p className="text-secondary-margin">{filtered.length} deals found</p>

          {filtered.length === 0 ? (
            <p className="text-secondary">No deals found from {cityName}.</p>
          ) : (
            filtered.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </section>
      </main>

      <footer className="bfd-footer">
        <div className="footer-content">
          <p className="footer-disclosure">Affiliate disclosure: Some links earn commission.</p>
          <p className="footer-trust">We only share deals we'd book ourselves.</p>
        </div>
      </footer>
    </div>
  );
}
