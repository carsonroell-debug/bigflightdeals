import { Link } from 'react-router-dom';
import deals from '../data/deals.json';
import DealCard from '../components/DealCard';

interface RouteFlightsPageProps {
  origin: string;
  destination: string;
}

// Map city names to codes and vice versa
const cityNames: Record<string, string> = {
  yyz: 'Toronto',
  yvr: 'Vancouver',
  yul: 'Montreal',
  yyc: 'Calgary',
  lis: 'Lisbon',
  cdg: 'Paris',
  lhr: 'London',
  ams: 'Amsterdam',
  ber: 'Berlin',
  fco: 'Rome',
  nrt: 'Tokyo',
  ist: 'Istanbul',
  ath: 'Athens',
  mad: 'Madrid',
};

// Reverse lookup: city name -> code
const cityCodes: Record<string, string> = {};
Object.entries(cityNames).forEach(([code, name]) => {
  cityCodes[name.toLowerCase()] = code.toUpperCase();
});

export default function RouteFlightsPage({ origin, destination }: RouteFlightsPageProps) {
  // Try to resolve city names to codes
  const originCode = cityCodes[origin.toLowerCase()] || origin.toUpperCase();
  const destCode = cityCodes[destination.toLowerCase()] || destination.toUpperCase();

  const originName = cityNames[originCode.toLowerCase()] || originCode;
  const destName = cityNames[destCode.toLowerCase()] || destCode;

  const filtered = deals.filter(
    d => d.origin_code === originCode && d.destination_code === destCode
  );

  return (
    <div className="bfd-app">
      <header className="bfd-header">
        <div className="breadcrumb">
          <Link to="/" className="back-link">&larr; All Deals</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/${origin.toLowerCase()}-flights`} className="back-link">{originName}</Link>
        </div>
        <h1>{originName} to {destName} Flights</h1>
        <p className="subtitle">Cheap flights from {originName} ({originCode}) to {destName} ({destCode}).</p>
      </header>

      <main className="bfd-main">
        <section className="bfd-results">
          <p className="text-secondary-margin">{filtered.length} deals found</p>

          {filtered.length === 0 ? (
            <p className="text-secondary">No deals found for this route.</p>
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
