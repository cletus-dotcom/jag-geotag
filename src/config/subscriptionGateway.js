/**
 * Subscription renewal gateway configuration.
 * Set this URL to your gateway portal (web or app deep link).
 * You will build a separate app for the gateway; link it here.
 */

/** Gateway portal base URL (query params for amount and data are appended when opening). */
export const SUBSCRIPTION_RENEWAL_GATEWAY_URL = 'https://example.com/jag-geotag-renewal';

/** Price per month in pesos (used for due amount calculation). */
export const PRICE_PER_MONTH_PESOS = 800;

/** Subscription period in days (used for per-day rate: PRICE_PER_MONTH / 30). */
export const SUBSCRIPTION_PERIOD_DAYS = 30;

/**
 * Calculate due amount for renewal.
 * Formula: 800 pesos per month + (800/30 * days passed after expiration).
 * @param {number} daysPassedAfterExpiration - Days since subscription expired (>= 0).
 * @returns {{ dueAmount: number, baseAmount: number, elapsedAmount: number, daysPassed: number }}
 */
export function calculateDueAmount(daysPassedAfterExpiration) {
  const days = Math.max(0, Math.ceil(daysPassedAfterExpiration));
  const baseAmount = PRICE_PER_MONTH_PESOS;
  const perDayRate = PRICE_PER_MONTH_PESOS / SUBSCRIPTION_PERIOD_DAYS;
  const elapsedAmount = perDayRate * days;
  const dueAmount = Math.round((baseAmount + elapsedAmount) * 100) / 100;
  return {
    dueAmount,
    baseAmount,
    elapsedAmount: Math.round(elapsedAmount * 100) / 100,
    daysPassed: days,
  };
}

/**
 * Build the full gateway URL with due amount and renewal data as query parameters.
 * Gateway can read: amount, currency, days_passed, expiry_date, base_amount, elapsed_amount.
 * @param {Object} subscriptionInfo - From getSubscriptionInfo(): { nextCheckDate, lastApprovedDate, daysRemaining }.
 * @returns {string} Full URL to open in browser/app.
 */
export function buildRenewalGatewayUrl(subscriptionInfo) {
  const base = SUBSCRIPTION_RENEWAL_GATEWAY_URL;
  const now = new Date();
  const expiryDate = subscriptionInfo?.nextCheckDate ? new Date(subscriptionInfo.nextCheckDate) : now;
  const daysPassedAfterExpiration =
    now > expiryDate
      ? Math.ceil((now - expiryDate) / (24 * 60 * 60 * 1000))
      : 0;

  const { dueAmount, baseAmount, elapsedAmount, daysPassed } = calculateDueAmount(daysPassedAfterExpiration);

  const params = new URLSearchParams({
    amount: String(dueAmount),
    currency: 'PHP',
    days_passed: String(daysPassed),
    expiry_date: expiryDate.toISOString(),
    base_amount: String(baseAmount),
    elapsed_amount: String(elapsedAmount),
  });

  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${params.toString()}`;
}

/**
 * Build gateway URL for first-time serial number purchase (no subscription yet).
 * Uses base amount 800 PHP and first_install=1 so gateway can show appropriate flow.
 */
export function buildFirstInstallGatewayUrl() {
  const base = SUBSCRIPTION_RENEWAL_GATEWAY_URL;
  const params = new URLSearchParams({
    first_install: '1',
    amount: String(PRICE_PER_MONTH_PESOS),
    currency: 'PHP',
  });
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${params.toString()}`;
}
