export function isCancelledDeparture(departure) {
  let cancelled = false;
  if (departure && departure.isCancelled && departure.cancellations) {
    const cancellation = departure.cancellations[0];
    cancelled = cancellation && cancellation.cancellationType === "CANCEL_DEPARTURE";
  }
  return cancelled;
}
