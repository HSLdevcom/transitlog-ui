import Info from "../icons/Info";
import AlertIcon from "../icons/Alert";
import {AlertLevel} from "./getAlertsInEffect";

export const getAlertStyle = (alert, asBackgroundColor = false) => {
  const level = typeof alert === "string" ? alert : alert.level;

  let Icon = level === AlertLevel.Info ? Info : AlertIcon;
  let color =
    level === AlertLevel.Info
      ? "var(--light-blue)"
      : level === AlertLevel.Warning
      ? "var(--yellow)"
      : "var(--red)";

  if (asBackgroundColor && level === AlertLevel.Severe) {
    color = "var(--pink)";
  }

  return {Icon, color};
};
