const BILLING_ORDER = ['headliner', 'festival', 'opener', 'other'];

export function getBillingPriority(billing: string) {
  const index = BILLING_ORDER.indexOf(billing.trim().toLowerCase());
  return index === -1 ? BILLING_ORDER.length : index;
}