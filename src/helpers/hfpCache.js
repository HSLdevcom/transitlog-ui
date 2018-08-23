import localforage from "localforage";

export function getCacheKey(date, route) {
  if (!route || !route.routeId || !route.dateBegin) {
    return false;
  }

  return `${date}.${route.routeId}.${route.direction}.${route.dateBegin}.${
    route.dateEnd
  }`;
}

export async function cacheData(hfpData, date, route) {
  if (!hfpData || hfpData.length === 0) {
    return;
  }

  const key = getCacheKey(date, route);

  if (!key) {
    return;
  }

  try {
    if (await localforage.getItem(key)) {
      await localforage.removeItem(key);
    }

    await localforage.setItem(key, hfpData);
  } catch (e) {
    console.log(e);
  }
}

export async function getCachedData(date, route) {
  const key = getCacheKey(date, route);
  let stored = null;

  try {
    stored = await localforage.getItem(key);
  } catch (err) {
    console.log(err);
  }

  if (!stored) {
    return [];
  }

  return stored;
}
