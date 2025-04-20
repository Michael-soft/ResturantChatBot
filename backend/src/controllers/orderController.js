const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RESERVED_OPTIONS = [0, 97, 98, 99, 96, 999]; // Reserved commands

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Calculate total amount
    const totalAmount = order.items.reduce((sum, item) => sum + item.price, 0);
    
    return res.json({
      orderId: order.id,
      status: order.status,
      items: order.items,
      totalAmount,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

exports.handleOrderAction = async (req, res, next) => {
  try {
    const { option, deviceId, payload } = req.body;
    if (!deviceId || typeof option !== 'number') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // If the option is not one of the reserved commands,
    // and if a current order in selection mode exists, attempt to add an item.
    if (!RESERVED_OPTIONS.includes(option)) {
      //  static menu IDs are: 1, 2, 3, 4.
      if ([1, 2, 3, 4].includes(option)) {
        // Check if a current order exists that is still in selection mode.
        const currentOrder = await orderService.getCurrentOrder(deviceId);
        if (currentOrder && currentOrder.isSelecting) {
          // Add the selected item to the order.
          const result = await orderService.addItemToCurrentOrder(deviceId, option);
          if (result.error) {
            return res.json({ response: result.error });
          } else {
            return res.json({ response: `Added ${result.addedItem.name} to your order. Current order items: ${result.order.items.join(', ')}` });
          }
        }
      }
      return res.json({ response: 'Please select a valid option.' });
    }

    // Process reserved commands using a switch-case.
    let responseMessage = '';
    switch (option) {
      case 1:
        // "Place an Order" when no active order exists.
        // Check if there is already an active order.
        let order = await orderService.getCurrentOrder(deviceId);
        if (order) {
          return res.json({ response: "You already have an active order. Please add items by entering the menu item IDs." });
        }
        // No active order: create one and return the menu.
        order = await orderService.createOrUpdateCurrentOrder(deviceId);
        const menuItems = orderService.getMenuItems();
        responseMessage = `Menu Items:\n${menuItems.map(item => `${item.id} - ${item.name} (₦${item.price})`).join('\n')}\nPlease select the item(s) by entering the menu item number.`;
        return res.json({ response: responseMessage, menu: menuItems });
      
      case 99:
        // Checkout order: Only works if there is an active order with items.
        const checkoutResult = await orderService.checkoutOrder(deviceId);
        responseMessage = checkoutResult
          ? "Order placed. Please type 999 and include your payment details (amount, email, reference) to pay."
          : "No order to place. Please add items to your order first.";
        return res.json({ response: responseMessage });
      
      case 98:
        // Return order history
        const orderHistory = await orderService.getOrderHistory(deviceId);
        responseMessage = orderHistory.length
          ? JSON.stringify(orderHistory, null, 2)
          : "No order history available.";
        return res.json({ response: responseMessage });
      
      case 97:
        // Return current active order
        const currentOrder = await orderService.getCurrentOrder(deviceId);
        responseMessage = currentOrder
          ? JSON.stringify(currentOrder, null, 2)
          : "No current order.";
        return res.json({ response: responseMessage });
      
      case 0:
        // Cancel the active order
        const cancelResult = await orderService.cancelOrder(deviceId);
        responseMessage = cancelResult ? "Order cancelled." : "No order to cancel.";
        return res.json({ response: responseMessage });
      
      case 96:
        // Optional: Schedule order.
        // Expect payload.scheduleTime e.g., "2025-05-01T12:00:00Z"
        if (!payload || !payload.scheduleTime) {
          return res.json({ response: "Please provide a schedule time in payload.scheduleTime (ISO format)." });
        }
        const scheduleResult = await orderService.scheduleOrder(deviceId, payload.scheduleTime);
        return res.json({ response: scheduleResult });
      
      case 999:
        // Process payment. Expected that payload contains paymentDetails.
        const { paymentDetails } = payload || {};
        if (!paymentDetails) {
          return res.status(400).json({ error: 'Missing payment details' });
        }
        const paymentResult = await paymentService.processPayment(paymentDetails);
        if (paymentResult.success) {
          responseMessage = "Payment successful. Thank you for your order!";
        } else {
          responseMessage = "Payment failed. Please try again.";
        }
        return res.json({ response: responseMessage });
      
      default:
        return res.status(400).json({ error: 'Invalid option selected.' });
    }
  } catch (error) {
    next(error);
  }
};

// at the bottom, after handleOrderAction


