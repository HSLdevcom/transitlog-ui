import {getDay, parseISO} from "date-fns";

// This is used to sort items (eg. departures) by day type.
// Thus it needs to be in the correct order.
export const dayTypes = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

// The getDay facilities of Javascript returns the day
// number in Sunday-first order, ie WRONG order.
const dayTypesWrongOrder = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export function getDayTypeFromDate(date) {
  return dayTypesWrongOrder[getDay(parseISO(date))];
}
