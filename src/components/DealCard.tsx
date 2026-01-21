import { FC } from 'react';
import ReactGA from 'react-ga4';
import { buildAffiliateUrl } from '../lib/affiliate';

interface Deal {
  id: string;
  origin: string;
  origin_code: string;
  destination: string;
  destination_code: string;
  price: number;
  currency: string;
  airline: string;
  link?: string;
  last_seen?: string;
}

interface DealCardProps {
  deal: Deal;
}

const DealCard: FC<DealCardProps> = ({ deal }) => {
  const handleClick = (): void => {
    // Fire GA4 deal_click event
    ReactGA.event({
      category: 'deal',
      action: 'deal_click',
      label: `${deal.origin_code}-${deal.destination_code} | $${deal.price} | ${deal.airline}`,
    });

    // Build affiliate URL and open
    const affiliateUrl = buildAffiliateUrl(deal);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="deal-card">
      <div className="deal-route">
        <span className="deal-origin">{deal.origin} ({deal.origin_code})</span>
        <span className="deal-arrow">→</span>
        <span className="deal-destination">{deal.destination} ({deal.destination_code})</span>
      </div>

      <div className="deal-meta">
        <div className="deal-price">
          <span className="price-amount">${deal.price}</span>
          <span className="price-currency">{deal.currency}</span>
        </div>
        <div className="deal-airline">{deal.airline}</div>
      </div>

      <button
        className="deal-cta"
        type="button"
        onClick={handleClick}
      >
        View Flight
      </button>
    </div>
  );
};

export default DealCard;

