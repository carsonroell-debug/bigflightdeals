/**
 * Affiliate URL builder for BigFlightDeals
 * Centralizes all affiliate link generation with consistent UTM tracking
 */

interface Deal {
  origin_code: string;
  destination_code: string;
  link?: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

// Travelpayouts affiliate marker - configure in env if needed
const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '605276';

/**
 * Build a Travelpayouts/Aviasales affiliate URL for a deal
 */
export function buildAffiliateUrl(deal: Deal, customUtm?: UTMParams): string {
  const origin = deal.origin_code;
  const destination = deal.destination_code;

  // Default UTM parameters
  const utm: UTMParams = {
    utm_source: 'bigflightdeals',
    utm_medium: 'affiliate',
    utm_campaign: 'deals',
    utm_content: `${origin}-${destination}`,
    ...customUtm,
  };

  // If deal has a custom link, use it; otherwise build Travelpayouts URL
  let baseUrl: string;
  if (deal.link && !deal.link.includes('travelpayouts.com')) {
    baseUrl = deal.link;
  } else {
    // Travelpayouts/Aviasales search URL format
    baseUrl = `https://www.aviasales.com/search/${origin}${destination}1?marker=${TRAVELPAYOUTS_MARKER}`;
  }

  // Append UTM parameters
  const separator = baseUrl.includes('?') ? '&' : '?';
  const utmString = Object.entries(utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');

  return `${baseUrl}${separator}${utmString}`;
}

/**
 * Build a generic affiliate URL with UTM tracking
 * Use this for non-deal affiliate links (e.g., partner links)
 */
export function buildGenericAffiliateUrl(
  rawUrl: string,
  params: {
    origin?: string;
    destination?: string;
  } & UTMParams
): string {
  const utm: UTMParams = {
    utm_source: params.utm_source || 'bigflightdeals',
    utm_medium: params.utm_medium || 'affiliate',
    utm_campaign: params.utm_campaign || 'deals',
    utm_content: params.utm_content || (params.origin && params.destination ? `${params.origin}-${params.destination}` : undefined),
  };

  const separator = rawUrl.includes('?') ? '&' : '?';
  const utmString = Object.entries(utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');

  return `${rawUrl}${separator}${utmString}`;
}
