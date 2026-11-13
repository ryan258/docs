// Pure presentation helper. For the Wix recipe, copy this file's contents to
// public/orderPresentation.js. It has no Node, Wix, credential, or network APIs.
const statusLabels = new Map([
  ['pending', 'Pending'],
  ['paid', 'Paid'],
  ['cancelled', 'Cancelled'],
]);

export function toOrderRows(orders) {
  if (!Array.isArray(orders) || orders.length > 50) {
    throw new TypeError('Expected an array of at most 50 orders');
  }

  return orders.map((order, index) => {
    if (!order || typeof order.id !== 'string' || !order.id.trim()
      || order.id.length > 128 || typeof order.total !== 'number'
      || !Number.isFinite(order.total) || order.total < 0) {
      throw new TypeError(`Invalid order at index ${index}`);
    }

    return {
      // Display positions are sufficient for this read-only list. The page
      // repaints existing repeater items when refreshing the data.
      _id: `order-${index + 1}`,
      orderText: `Order ${order.id}`,
      totalText: `$${order.total.toFixed(2)} USD`,
      statusText: statusLabels.get(order.status) ?? 'Status unavailable',
    };
  });
}
