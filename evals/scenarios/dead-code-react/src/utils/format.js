export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// DEAD: exported but never imported anywhere
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
