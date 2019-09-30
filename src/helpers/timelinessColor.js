export function getTimelinessColor(timeliness, defaultColor = "", darkYellow = false) {
  switch (timeliness) {
    case "on-time":
      return "var(--light-green)";
    case "early":
      return "var(--red)";
    case "late":
      if (darkYellow) {
        return "var(--dark-yellow)";
      } else {
        return "var(--yellow)";
      }
    case "unsigned":
      return "var(--grey)";
    case "planned":
    default:
      return defaultColor;
  }
}
