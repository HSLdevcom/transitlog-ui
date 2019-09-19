import get from "lodash/get";
import orderBy from "lodash/orderBy";
import differenceInMinutes from "date-fns/difference_in_minutes";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

export const AlertLevel = {
  Info: "INFO",
  Warning: "WARNING",
  Severe: "SEVERE",
};

export const AlertDistribution = {
  Stop: "STOP",
  AllStops: "ALL_STOPS",
  Route: "ROUTE",
  AllRoutes: "ALL_ROUTES",
  Network: "NETWORK",
};

const timeProps = [
  "recordedAt",
  "events[0].recordedAt",
  "journey.events[0].recordedAt",
  "observedDepartureTime.departureDateTime",
  "plannedDepartureTime.departureDateTime",
  "observedArrivalTime.arrivalDateTime",
  "plannedArrivalTime.arrivalDateTime",
];

export const getAlertsInEffect = (
  objectWithAlerts = [],
  time,
  includeNetworkAlerts = false
) => {
  // The first priority is to get the time from the object with the alerts
  // according to the possible timeProps above. If that fails, use the `time` argument.
  const objectTimeProp = timeProps.find((tp) => get(objectWithAlerts, tp, false));
  let alertTime = get(objectWithAlerts, objectTimeProp, time);
  // If the time is a shorter string, that means that it is a date without the time part.
  // In that case we should show all alerts for the day.
  const timeIsDate = typeof alertTime === "string" && alertTime.length < 11;
  const currentMoment = moment.tz(alertTime, TIMEZONE);

  const alerts = get(
    objectWithAlerts,
    "alerts",
    objectWithAlerts && Array.isArray(objectWithAlerts) ? objectWithAlerts : []
  );

  function filterByDate(alert) {
    return currentMoment.isBetween(
      alert.startDateTime,
      alert.endDateTime,
      timeIsDate ? "day" : "hour",
      "[]"
    );
  }

  const alertsInEffect = alerts.filter(filterByDate);

  const sortedAlerts = orderBy(
    alertsInEffect,
    [
      (alert) => {
        let sortVal = 0;

        if (alert.level === "SEVERE") {
          sortVal += 1000;
        }

        if (alert.level === "WARNING") {
          sortVal += 10;
        }

        if (alert.distribution === AlertDistribution.Network) {
          sortVal += 100;
        }

        if (
          [AlertDistribution.AllRoutes, AlertDistribution.AllStops].includes(
            alert.distribution
          )
        ) {
          sortVal += 10;
        }

        return sortVal;
      },
      (alert) => differenceInMinutes(alert.startDateTime, currentMoment.toDate()),
      (alert) => differenceInMinutes(alert.endDateTime, currentMoment.toDate()),
    ],
    ["desc", "asc", "asc"]
  );

  if (Array.isArray(objectWithAlerts)) {
    return sortedAlerts;
  }

  return sortedAlerts.reduce((alerts, alert) => {
    if (includeNetworkAlerts && alert.distribution === AlertDistribution.Network) {
      alerts.push(alert);
    } else if (
      (alert.distribution === AlertDistribution.Route &&
        objectWithAlerts.routeId === alert.affectedId) ||
      (alert.distribution === AlertDistribution.AllRoutes &&
        typeof objectWithAlerts.routeId !== "undefined")
    ) {
      alerts.push(alert);
    } else if (
      (alert.distribution === AlertDistribution.Stop &&
        objectWithAlerts.stopId === alert.affectedId) ||
      (alert.distribution === AlertDistribution.AllStops &&
        typeof objectWithAlerts.stopId !== "undefined")
    ) {
      alerts.push(alert);
    }

    return alerts;
  }, []);
};
