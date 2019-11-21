import {ApolloClient} from "apollo-client";
import {ApolloLink} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache, IntrospectionFragmentMatcher} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import {setContext} from "apollo-link-context";
import fragmentTypes from "./fragmentTypes";
import uniqBy from "lodash/uniqBy";

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
    if (graphQLErrors) {
      uniqBy(graphQLErrors, (err) => err.message).map((err) => console.error(err));
    }

    if (networkError) {
      notifyError(
        "Network",
        "Network error. Please refresh the page to try again, or contact the Reittiloki team if the error persists.",
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

  const contextLink = setContext((operation, prevContext) => {
    const {headers} = prevContext;

    if (typeof operation.variables._cache !== "undefined") {
      delete operation.variables._cache;

      return {
        ...prevContext,
        headers: {
          ...headers,
          "x-skip-cache": "true",
        },
      };
    }
  });

  const cache = new InMemoryCache({
    fragmentMatcher,
    addTypename: true,
  });

  const httpLink = new HttpLink({
    uri: serverUrl,
    credentials: "include",
  });

  createdClient = new ApolloClient({
    link: ApolloLink.from([errorLink, contextLink, httpLink]),
    cache: cache,
  });

  return createdClient;
};
