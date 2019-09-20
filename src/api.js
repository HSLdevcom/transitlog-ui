import {ApolloClient} from "apollo-client";
import {concat} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
  HeuristicFragmentMatcher,
} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import get from "lodash/get";
import fragmentTypes from "./fragmentTypes";

const serverUrl = process.env.REACT_APP_TRANSITLOG_SERVER_GRAPHQL;

if (!serverUrl) {
  console.error("Transitlog server URL not set!");
}

function createErrorLink(UIStore) {
  function notifyError(type, message, target) {
    if (UIStore) {
      return UIStore.addError(type, message, target);
    }

    console.warn(`${type} error: ${message}, target: ${target}`);
  }

  return onError(({graphQLErrors, networkError, operation}) => {
    if (graphQLErrors && process.env.NODE_ENV === "development") {
      graphQLErrors.map((err) => console.warn(err.message));
    }

    if (networkError) {
      notifyError(
        "Network",
        get(
          networkError,
          "message",
          JSON.stringify(get(networkError, "result", networkError))
        ),
        operation.operationName
      );
    }
  });
}

let createdClient = null;

export const getClient = (UIStore) => {
  if (createdClient) {
    return createdClient;
  }

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: fragmentTypes,
  });

  const errorLink = createErrorLink(UIStore);
  const cache = new InMemoryCache({fragmentMatcher});

  const httpLink = new HttpLink({
    uri: serverUrl,
    credentials: "include",
  });

  createdClient = new ApolloClient({
    link: concat(errorLink, httpLink),
    cache: cache,
  });

  return createdClient;
};
