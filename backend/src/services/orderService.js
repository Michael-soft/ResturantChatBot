const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Global static menu items (you can later replace this with a database call)
const MENU_ITEMS = [
  { id: 1, name: 'Margherita Pizza', price: 800 },
  { id: 2, name: 'Spaghetti Carbonara', price: 1200 },
  { id: 3, name: 'Caesar Salad', price: 500 },
  { id: 4, name: 'Grilled Chicken', price: 1500 }
];

exports.getMenuItems = () => MENU_ITEMS;

/**
 * Creates a new current order for the device.
 */
exports.createOrUpdateCurrentOrder = async (deviceId) => {
  let order = await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current' }
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        userDeviceId: deviceId,
        items: [],
        status: 'current',
        isSelecting: true
      }
    });
  }
  return order;
};

/**
 * Adds a menu item to the current active order.
 */
exports.addItemToCurrentOrder = async (deviceId, itemId) => {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) {
    return { error: 'Invalid item selection.' };
  }
  
  // Find current active order in selection mode.
  let order = await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current', isSelecting: true }
  });
  if (!order) {
    return { error: 'No active order. Please start an order first with option 1.' };
  }
  
  // Append the item name to the order.items array.
  const updatedItems = order.items.concat(item.name);
  order = await prisma.order.update({
    where: { id: order.id },
    data: { items: updatedItems }
  });
  return { order, addedItem: item };
};

/**
 * Checkout the current order.
 * Only allow checkout if there is an order with at least one item.
 * Mark the order status as 'placed' and disable further selections.
 */
exports.checkoutOrder = async (deviceId) => {
  const order = await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current' }
  });
  if (order && order.items.length > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'placed', isSelecting: false }
    });
    return true;
  }
  return false;
};

exports.getOrderHistory = async (deviceId) => {
  return await prisma.order.findMany({
    where: { userDeviceId: deviceId, status: 'placed' },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getCurrentOrder = async (deviceId) => {
  return await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current' }
  });
};

exports.cancelOrder = async (deviceId) => {
  const order = await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current' }
  });
  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' }
    });
    return true;
  }
  return false;
};

/**
 * Optional: Schedule the active order.
 * This is a stub implementation. In production, you could update the order with a scheduled time.
 */
exports.scheduleOrder = async (deviceId, scheduleTime) => {
  const order = await prisma.order.findFirst({
    where: { userDeviceId: deviceId, status: 'current' }
  });
  if (!order) {
    return "No active order to schedule. Please start an order first with option 1.";
  }
  // Update the order with the scheduled time (assuming ISO date string provided).
  await prisma.order.update({
    where: { id: order.id },
    data: { scheduledAt: new Date(scheduleTime) }
  });
  return `Order scheduled for ${scheduleTime}.`;
};
