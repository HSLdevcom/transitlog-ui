import Metolib from "@fmidev/metolib";
import weatherQueue from "./weatherQueue";

const SERVER_URL = `https://opendata.fmi.fi/wfs`;
const STORED_QUERY_OBSERVATION = "livi::observations::road::multipointcoverage";

export async function getRoadConditionsForArea(
  bbox,
  startDate,
  endDate,
  setCancelCallback
) {
  if (!bbox || !startDate || !endDate) {
    return Promise.reject("All arguments are not valid.");
  }

  const roadPromise = () =>
    new Promise((resolve, reject) => {
      const connection = new Metolib.WfsConnection();
      if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
        setCancelCallback(() => connection.disconnect());

        connection.getData({
          requestParameter: "rscal,rscst,rscif,rsil",
          begin: startDate,
          end: endDate,
          timestep: 60 * 60 * 1000,
          bbox,
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

  return weatherQueue.add(roadPromise).catch((err) => console.log(err));
}
