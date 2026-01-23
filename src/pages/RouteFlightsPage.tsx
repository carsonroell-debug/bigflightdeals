import { Link } from 'react-router-dom';
import ReactGA from 'react-ga4';
import deals from '../data/deals.json';
import DealCard from '../components/DealCard';
import { buildAffiliateUrl } from '../lib/affiliate';

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

  // Get cheapest deal for primary CTA
  const cheapestDeal = filtered.length > 0
    ? filtered.reduce((min, d) => d.price < min.price ? d : min, filtered[0])
    : null;

  // Get other deals from same origin for internal linking
  const otherFromOrigin = deals
    .filter(d => d.origin_code === originCode && d.destination_code !== destCode)
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  // Primary CTA click handler
  const handlePrimaryCTA = () => {
    if (!cheapestDeal) return;

    ReactGA.event({
      category: 'cta',
      action: 'primary_cta_click',
      label: `${originCode}-${destCode} | $${cheapestDeal.price}`,
    });

    // Also fire deal_click for consistency
    ReactGA.event({
      category: 'deal',
      action: 'deal_click',
      label: `${cheapestDeal.origin_code}-${cheapestDeal.destination_code} | $${cheapestDeal.price} | ${cheapestDeal.airline}`,
    });

    const affiliateUrl = buildAffiliateUrl(cheapestDeal);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

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

      {/* Primary CTA - Above the fold */}
      {cheapestDeal && (
        <section className="primary-cta">
          <p className="primary-cta-label">Cheapest flight from {originCode} to {destCode} right now</p>
          <button className="primary-cta-button" onClick={handlePrimaryCTA}>
            Book for ${cheapestDeal.price} {cheapestDeal.currency}
          </button>
          <p className="primary-cta-meta">{cheapestDeal.airline} · {cheapestDeal.depart_date || 'Flexible dates'}</p>
        </section>
      )}

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

      {/* Internal linking - More deals from origin */}
      {otherFromOrigin.length > 0 && (
        <section className="internal-links">
          <h3>More deals from {originName}</h3>
          <div className="internal-links-list">
            {otherFromOrigin.map(deal => (
              <Link
                key={deal.id}
                to={`/${originCode.toLowerCase()}-to-${deal.destination.toLowerCase().replace(/\s+/g, '-')}-flights`}
                className="internal-link"
              >
                {deal.destination} from ${deal.price}
              </Link>
            ))}
          </div>
          <Link to={`/${originCode.toLowerCase()}-flights`} className="internal-link-more">
            View all {originName} flights →
          </Link>
        </section>
      )}

      {/* TravelPackAI Cross-sell */}
      <section className="cross-sell">
        <p className="cross-sell-text">
          Packing for {destName}?{' '}
          <a
            href={`https://travelpackai.com/?utm_source=bigflightdeals&utm_medium=cross_sell&utm_campaign=packing_tool&utm_content=${destCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cross-sell-link"
          >
            Generate a free packing list
          </a>
        </p>
      </section>

      <footer className="bfd-footer">
        <div className="footer-content">
          <p className="footer-disclosure">Affiliate disclosure: Some links earn commission.</p>
          <p className="footer-trust">We only share deals we'd book ourselves.</p>
        </div>
      </footer>
    </div>
  );
}
