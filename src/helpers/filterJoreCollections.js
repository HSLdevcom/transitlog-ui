import {isWithinRange} from "./isWithinRange";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import get from "lodash/get";
import first from "lodash/first";
import last from "lodash/last";
import flatten from "lodash/flatten";
import diffHours from "date-fns/differenceInHours";
import diffDays from "date-fns/differenceInDays";
import {MAX_JORE_YEAR} from "../constants";

import {legacyParse} from "@date-fns/upgrade/v2";

export function filterActive(items, date) {
  if (!date) {
    return items;
  }

  return items.filter((item) => isWithinRange(date, item.dateBegin, item.dateEnd));
}

// JORE objects have dateBegin and dateEnd props that express a validity range.
// We have a problem where there can be multiple objects with overlapping
// validity ranges
export function getValidItemsByDateChains(groups, date, log = false) {
  const validGroups = reduce(
    groups,
    (filtered, items) => {
      // If it's only one item, we're good.
      if (items.length === 1) {
        filtered.push(filterActive(items, date));
        return filtered;
      }

      // Get the minimum dateBegin amongst the items
      const dateBeginOrdered = orderBy(items, "dateBegin", "asc");
      const minDate = get(first(dateBeginOrdered), "dateBegin");

      // Order the items descending from the most distant dateEnd. This
      // is the array we'll pull items from and add to the chain.
      const dateEndOrdered = orderBy(items, "dateEnd", "desc");

      // This function searches the ordered array to find the next link in the chain.
      // It checks the candidate's dateEnd if it is exactly a day off from item.
      // If it returns false, it did not find a result and item would end the chain.
      function findNextLink(item) {
        if (!item) {
          return false;
        }

        for (const candidate of dateEndOrdered) {
          const hoursDiff = diffHours(
            legacyParse(
              // To get a positive number, put the date we presume to be LATER first.
              get(item, "dateBegin", MAX_JORE_YEAR + "-12-31")
            ),
            legacyParse(
              // and put the date we presume to be EARLIER second.
              get(candidate, "dateEnd", MAX_JORE_YEAR + "-12-31")
            )
          );

          // If the candidate's dateEnd is roughly one day before our item's dateBegin,
          // it is a valid link for the chain. Need to use hours because of DST.
          if (hoursDiff > 22 && hoursDiff < 26) {
            return candidate;
          }
        }

        // Returning false means that the item we passed into this
        // function is the last in the chain.
        return false;
      }

      // Create a chain and use the item passed in as "startingPoint" to start it off.
      function createChain(startingPoint) {
        const chain = [];

        if (!startingPoint) {
          return chain;
        }

        // Keep track of the iteration so that we can
        // kill the loop if it happens to run off.
        let i = 0;
        const maxIterations = 100;

        // Extra precautions for runaway loops.
        while (get(last(chain), "dateBegin") !== minDate && i < maxIterations) {
          if (chain.length === 0) {
            // Use the starting item to start it off. This would be the "last" item in the chain.
            chain.push(startingPoint);
          }

          // Pick the last added item.
          const item = last(chain);
          const nextItem = findNextLink(item);

          // If there isn't anything to add, I guess we're done...
          if (!nextItem) {
            break;
          }

          chain.push(nextItem);
          i++;
        }

        // Since we went with the most distant endDate first, the chain is reversed.
        // The rest of the app, as well as the user, expects the items to be in ascending
        // chronological order so the chain just needs to be reversed again.
        chain.reverse();
        return chain;
      }

      // Build competing chains
      const chains = dateEndOrdered.map(createChain);

      if (log) {
        console.log(chains);
      }

      // The lack of chains is not very useful, so bail here in that case.
      if (chains.length === 0) {
        return filtered;
      }

      const lengthOrdered = orderBy(chains, "length", "desc");
      // Declare the winner of the chain competition. Longest chain wins.
      const longestChain = lengthOrdered[0];
      const longestLength = longestChain.length;

      // Empty chains are not very useful, so bail here in that case.
      if (longestLength === 0) {
        return filtered;
      }

      // There may be multiple chains with the same length. They all share the first
      // prize, but we still need to declare an actual winner.
      let winningChains = lengthOrdered.filter((chain) => chain.length === longestLength);

      // Default to the first one. If there is only one longest chain, it will be used.
      let winningChain = winningChains[0];

      // In the case of many longest chains, further logic is needed. This means
      // that items have probably been deleted and modified in JORE, like for
      // exceptions that are in effect for a shorter time. Thus we want the
      // chain that has the least amount of days between its items.
      if (winningChains.length > 1) {
        // First make sure that the chains actually have a valid item
        winningChains = winningChains.filter(
          (chain) => filterActive(chain, date).length !== 0
        );

        if (winningChains.length > 0) {
          // Pick the chain with the least amount of days when where are many
          // with the same length. The logic is that this should result in a
          // "tighter fit" around the current date.
          winningChain = orderBy(
            winningChains,
            (chain) => {
              let days = 0;

              for (const item of chain) {
                days += diffDays(legacyParse(item.dateEnd), legacyParse(item.dateBegin));
              }

              return days;
            },
            "asc"
          )[0]; // The shortest-by-days chain is first
        }
      }

      // Get the item that is active for the selected date from the chain of valid items.
      filtered.push(filterActive(winningChain, date));
      return filtered;
    },
    []
  );

  return flatten(validGroups);
}

export function filterDepartures(departures, date) {
  const groupedDepartures = groupBy(
    departures,
    (departure) =>
      departure.routeId +
      departure.direction +
      departure.hours +
      departure.minutes +
      departure.stopId +
      departure.dayType +
      departure.extraDeparture
  );

  return getValidItemsByDateChains(groupedDepartures, date);
}

export function filterRouteSegments(routeSegments, date) {
  // The segments may contain items that are identical and have overlapping
  // in-effect ranges resulting in doubles showing up in the UI lists.
  // They are filtered out here.
  const groupedSegments = groupBy(
    routeSegments,
    (segment) => segment.routeId + segment.direction + segment.stopIndex
  );

  return getValidItemsByDateChains(groupedSegments, date, false);
}

export function filterLines(lines, date) {
  const groupedLines = groupBy(lines, "lineId");
  return getValidItemsByDateChains(groupedLines, date);
}

export function filterRoutes(routes, date) {
  const groupedRoutes = groupBy(
    routes,
    ({routeId, direction}) => `${routeId}.${direction}`
  );

  return getValidItemsByDateChains(groupedRoutes, date);
}
