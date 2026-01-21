import { useParams } from "react-router-dom";
import deals from "../data/deals.json";
import DealCard from "../components/DealCard";

export default function RoutePage() {
  const { origin, destination } = useParams();
  const o = origin?.toUpperCase();
  const d = destination?.toUpperCase();

  const filtered = deals.filter(
    (x) => x.origin_code === o && x.destination_code === d
  );

  return (
    <div className="bfd-app">
      <header className="bfd-header">
        <h1>{o} → {d} Flights</h1>
        <p className="subtitle">Cheap flights from {o} to {d}.</p>
      </header>

      <main className="bfd-main">
        <section className="bfd-results">
          <p className="text-secondary-margin">{filtered.length} deals found</p>

          {filtered.length === 0 ? (
            <p className="text-secondary">No deals found yet.</p>
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

