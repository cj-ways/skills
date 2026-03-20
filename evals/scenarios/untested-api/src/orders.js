const orders = [];

export function getOrders() {
  return orders;
}

export function getOrderById(id) {
  return orders.find((o) => o.id === id) || null;
}

export function createOrder(userId, items) {
  if (!userId) throw new Error("userId is required");
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("items must be a non-empty array");
  }

  const total = items.reduce((sum, item) => {
    if (!item.price || item.price < 0) throw new Error("Invalid item price");
    return sum + item.price * (item.quantity || 1);
  }, 0);

  const order = {
    id: orders.length + 1,
    userId,
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  return order;
}

export function cancelOrder(id) {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  if (order.status === "shipped") throw new Error("Cannot cancel shipped order");
  order.status = "cancelled";
  return order;
}
