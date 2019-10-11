import getDay from "date-fns/getDay";

import {legacyParse} from "@date-fns/upgrade/v2";

// This is used to sort items (eg. departures) by day type.
// Thus it needs to be in the correct order.
export const dayTypes = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

// The getDay facilities of Javascript returns the day
// number in Sunday-first order, ie WRONG order.
const dayTypesWrongOrder = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export function getDayTypeFromDate(date) {
  return dayTypesWrongOrder[getDay(legacyParse(date))];
}
