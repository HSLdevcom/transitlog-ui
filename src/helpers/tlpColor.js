export const getDecisionColor = (decision) => {
  switch (decision) {
    case "ACK":
      return "var(--green)";
    case "NAK":
      return "var(--red)";
    default:
      return "var(--grey)";
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "NORMAL":
      return "var(--green)";
    case "HIGH":
      return "var(--blue)";
    case "NOREQUEST":
      return "var(--yellow)";
    default:
      return "var(--grey)";
  }
};
