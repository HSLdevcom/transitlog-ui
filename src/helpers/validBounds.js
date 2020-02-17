export function validBounds(bounds) {
  return !!bounds && typeof bounds.isValid === "function" && bounds.isValid();
}
