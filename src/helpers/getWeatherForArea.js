import Metolib from "@fmidev/metolib";
import weatherQueue from "./weatherQueue";

const SERVER_URL = `https://opendata.fmi.fi/wfs`;
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

export async function getWeatherForArea(sites, startDate, endDate, setCancelCallback) {
  if (!sites || sites.length === 0 || !startDate || !endDate) {
    return Promise.reject("All arguments are not valid.");
  }

  const weatherPromise = () =>
    new Promise((resolve, reject) => {
      const connection = new Metolib.WfsConnection();
      setCancelCallback(() => connection.disconnect());

      if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
        connection.getData({
          requestParameter: "t2m",
          begin: startDate,
          end: endDate,
          timestep: 10 * 60 * 1000,
          fmisid: sites,
          callback: function(data, errors) {
            connection.disconnect();

            if (errors.length !== 0) {
              reject(errors);
            } else {
              resolve(data);
            }
          },
        });
      } else {
        reject(["No connection"]);
      }
    });

  return weatherQueue.add(weatherPromise);
}
