import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";

const joreClient = new ApolloClient({
  link: new HttpLink({uri: "https://dev-kartat.hsldev.com/jore-history/graphql"}),
  cache: new InMemoryCache({
    dataIdFromObject: (obj) => {
      if (typeof obj.nodeId !== "undefined") {
        return obj.nodeId;
      }

      if (obj.__typename === "Line") {
        return `${obj.lineId}:${obj.dateBegin}:${obj.dateEnd}`;
      }

      return defaultDataIdFromObject(obj);
    },
  }),
});

const hfpClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://sandbox-1.hsldev.com/v1alpha1/graphql",
  }),
  cache: new InMemoryCache({
    dataIdFromObject: (obj) => {
      switch (obj.__typename) {
        case "Vehicle":
          return `${obj.receivedAt}:${obj.routeId}:${obj.directionId}`;
        default:
          return defaultDataIdFromObject(obj);
      }
    },
  }),
});

export {joreClient, hfpClient};
