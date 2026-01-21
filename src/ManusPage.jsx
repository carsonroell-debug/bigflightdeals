import deals from "./data/deals.json";

function buildTravelpayoutsLink(deal) {
  const marker = "605276"; // leave placeholder
  const origin = deal.origin_code;
  const destination = deal.destination_code;
  return `https://www.aviasales.com/search/${origin}${destination}1?marker=${marker}`;
}
export default function ManusPage() {
  return (
    <div className="bfd-app">
      <header className="bfd-header">
        <h1>Big Flight Deals</h1>
        <p className="subtitle">Find cheap flights. Fast. No fluff.</p>
        <p className="header-description">Real-time flight deals from trusted airlines. Updated daily.</p>
      </header>

      <main className="bfd-main">
        <section className="bfd-search">
          <h2>Search Deals</h2>

          <div className="search-row">
            <input type="text" placeholder="From (e.g. Toronto)" />
            <input type="text" placeholder="To (e.g. Lisbon)" />
            <button type="button">Find Deals</button>
          </div>
        </section>

        <section className="bfd-results">
          <h2>Latest Deals</h2>

          {deals.map((d) => (
            <div className="deal-card" key={d.id}>
              <div className="deal-route">
                <span className="deal-origin">{d.origin} ({d.origin_code})</span>
                <span className="deal-arrow">→</span>
                <span className="deal-destination">{d.destination} ({d.destination_code})</span>
              </div>

              <div className="deal-meta">
                <div className="deal-price">
                  <span className="price-amount">${d.price}</span>
                  <span className="price-currency">{d.currency}</span>
                </div>
                <div className="deal-airline">{d.airline}</div>
              </div>

              <button
                className="deal-cta"
                type="button"
                onClick={() => {
                  window.trackDealClick?.({
                    deal_id: d.id,
                    origin: d.origin,
                    destination: d.destination,
                    price: d.price,
                    currency: d.currency,
                    airline: d.airline,
                  });
                  window.open(buildTravelpayoutsLink(d), "_blank", "noopener,noreferrer");
                }}
              >
                View Flight
              </button>
            </div>
          ))}
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
