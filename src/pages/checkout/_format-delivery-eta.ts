export function formatDeliveryEta(
  etaMinDays: number,
  etaMaxDays: number,
): string {
  if (etaMinDays === etaMaxDays) {
    return etaMinDays === 1 ? '1 day' : `${etaMinDays} days`
  }
  return `${etaMinDays}–${etaMaxDays} days`
}
