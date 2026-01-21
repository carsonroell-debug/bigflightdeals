import deals from "../data/deals.json";
import DealCard from "../components/DealCard";

export default function HomePage() {
  const displayedDeals = deals.slice(0, 20);

  return (
    <div className="bfd-app">
      <header className="bfd-header">
        <h1>Big Flight Deals</h1>
        <p className="subtitle">Find cheap flights. Fast. No fluff.</p>
        <p className="header-description">Real-time flight deals from trusted airlines. Updated daily.</p>
      </header>

      <main className="bfd-main">
        <section className="bfd-results">
          <h2>Latest Deals</h2>
          <p className="text-secondary-margin">{deals.length} deals loaded</p>

          {displayedDeals.length === 0 ? (
            <p className="text-secondary">No deals found yet.</p>
          ) : (
            displayedDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
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

