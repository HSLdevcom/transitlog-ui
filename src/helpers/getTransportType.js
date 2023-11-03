import "../components/LineIcon.css";

function getTransportType(lineId = "", numeric = false, trunk = false) {
  const lineType = lineId.substring(0, 4);

  if (lineType >= 1001 && lineType <= 1010) {
    if (numeric) {
      return 0;
    }

    return "TRAM";
  }

  if (lineType == 2015) {
    if (numeric) {
      return 0;
    }

    return "L_RAIL";
  }

  // The only ferry routes are 1019 and 1019E.
  if (lineId.startsWith("1019")) {
    if (numeric) {
      return 50;
    }

    return "FERRY";
  }

  // Subway route ID's all start with 31M
  if (lineId.startsWith("31M")) {
    if (numeric) {
      return 20;
    }

    return "SUBWAY";
  }

  if (/^300[12]/.test(lineType)) {
    if (numeric) {
      return 100;
    }

    return "RAIL";
  }

  if (trunk) {
    if (numeric) {
      return 1000;
    }

    return "TRUNK";
  }

  if (numeric) {
    return 1000;
  }

  return "BUS";
}

export default getTransportType;
