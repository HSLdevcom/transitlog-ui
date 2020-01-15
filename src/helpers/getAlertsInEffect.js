import get from "lodash/get";
import orderBy from "lodash/orderBy";
import differenceInMinutes from "date-fns/differenceInMinutes";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

import {legacyParse} from "@date-fns/upgrade/v2";

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
  "vehiclePositions[0].recordedAt",
  "journey.vehiclePositions[0].recordedAt",
  "events[0].recordedAt",
  "journey.events[0].recordedAt",
  "observedDepartureTime.departureDateTime",
  "plannedDepartureTime.departureDateTime",
  "observedArrivalTime.arrivalDateTime",
  "plannedArrivalTime.arrivalDateTime",
];

export const orderAlerts = (alerts, compareDate = new Date()) => {
  const sortedAlerts = orderBy(
    alerts,
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
      (alert) => differenceInMinutes(legacyParse(alert.startDateTime), compareDate),
      (alert) => differenceInMinutes(legacyParse(alert.endDateTime), compareDate),
    ],
    ["desc", "asc", "desc"]
  );

  return sortedAlerts;
};

export const getAlertsInEffect = (
  objectWithAlerts = [],
  time,
  includeNetworkAlerts = false
) => {
  const currentMoment = moment.tz(time, TIMEZONE);

  const alerts = get(
    objectWithAlerts,
    "alerts",
    objectWithAlerts && Array.isArray(objectWithAlerts) ? objectWithAlerts : []
  );

  function filterByDate(alert) {
    return currentMoment.isBetween(alert.startDateTime, alert.endDateTime, "day", "[]");
  }

  const alertsInEffect = alerts.filter(filterByDate);
  const sortedAlerts = orderAlerts(alertsInEffect, currentMoment.toDate());

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
