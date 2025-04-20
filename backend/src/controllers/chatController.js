/**
 * ChatController: Handles chat interactions with the user.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Restaurant menu items
const menuItems = [
  { id: 1, name: 'Pizza', price: 1000, description: 'Delicious pizza with your choice of toppings' },
  { id: 2, name: 'Burger', price: 800, description: 'Juicy burger with lettuce, tomato, and cheese' },
  { id: 3, name: 'Salad', price: 600, description: 'Fresh salad with mixed greens and vinaigrette' },
  { id: 4, name: 'Pasta', price: 900, description: 'Al dente pasta with your choice of sauce' },
  { id: 5, name: 'Sandwich', price: 700, description: 'Fresh sandwich with your choice of fillings' },
  { id: 6, name: 'Soup', price: 500, description: 'Warm soup of the day' },
  { id: 7, name: 'Dessert', price: 400, description: 'Sweet treat to finish your meal' },
  { id: 8, name: 'Drink', price: 300, description: 'Refreshing beverage' }
];

// Helper function to get current order
async function getCurrentOrder(deviceId) {
  return await prisma.order.findFirst({
    where: {
      userDeviceId: deviceId,
      isSelecting: true
    }
  });
}

// Helper function to get order history
async function getOrderHistory(deviceId) {
  return await prisma.order.findMany({
    where: {
      userDeviceId: deviceId,
      isSelecting: false,
      status: 'placed'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

const handleChat = async (req, res) => {
  try {
    const { message, deviceId } = req.body;
    let response = '';

    // Get current order
    const currentOrder = await getCurrentOrder(deviceId);

    // Handle scheduling
    if (message.toLowerCase().startsWith('schedule ')) {
      const scheduledTime = message.substring(8).trim();
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      
      if (!dateRegex.test(scheduledTime)) {
        return res.json({ 
          response: 'Invalid date format. Please use YYYY-MM-DD HH:mm format (e.g., 2024-03-25 18:00)' 
        });
      }

      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate < new Date()) {
        return res.json({ 
          response: 'Cannot schedule order for a past date. Please select a future date and time.' 
        });
      }

      if (!currentOrder) {
        return res.json({ 
          response: 'You need to place an order first before scheduling it. Please select items to order.' 
        });
      }

      // Update order with scheduled time
      await prisma.order.update({
        where: { id: currentOrder.id },
        data: { 
          scheduledFor: scheduledDate,
          status: 'scheduled'
        }
      });

      return res.json({ 
        response: `Order #${currentOrder.id} has been scheduled for ${scheduledTime}. You will receive a confirmation when the order is ready.` 
      });
    }

    // Handle other messages
    switch (message) {
      case 'start':
        response = 'Welcome to Our Restaurant Chatbot! Please select an option:\n\n' +
                  '1 - Place an Order (or add items if order is active)\n' +
                  '99 - Checkout Order\n' +
                  '98 - See Order History\n' +
                  '97 - See Current Order\n' +
                  '0 - Cancel Order\n' +
                  '96 - Schedule Order (optional)';
        break;

      case '1': {
        if (currentOrder) {
          // If there's an active order, show the menu to add more items
          const menuText = menuItems.map(item => 
            `${item.id}. ${item.name} - ₦${item.price.toFixed(2)}`
          ).join('\n');
          
          response = `You have an active order. Would you like to add more items?\n\nAvailable items:\n${menuText}\n\nPlease enter the number of the item you want to add to your order.`;
        } else {
          // If no active order, create a new one and show the menu
          await prisma.order.create({
            data: {
              userDeviceId: deviceId,
              status: 'active',
              items: []
            }
          });
          
          const menuText = menuItems.map(item => 
            `${item.id}. ${item.name} - ₦${item.price.toFixed(2)}`
          ).join('\n');
          
          response = `Great! What would you like to order?\n\nAvailable items:\n${menuText}\n\nPlease enter the number of the item you want to order.`;
        }
        break;
      }

      case '99': {
        if (!currentOrder) {
          response = `No order to place. Would you like to place a new order?\n\n1 - Place a new order\n0 - Cancel`;
        } else {
          // Calculate total
          const items = currentOrder.items || [];
          const total = items.reduce((sum, itemId) => {
            const item = menuItems.find(i => i.id === parseInt(itemId));
            return sum + (item ? item.price : 0);
          }, 0);
          
          if (total === 0) {
            response = `Your order is empty. Would you like to add items?\n\n1 - Add items\n0 - Cancel order`;
          } else {
            // Update order status
            await prisma.order.update({
              where: { id: currentOrder.id },
              data: { status: 'placed' }
            });
            
            response = `Order #${currentOrder.id} placed successfully! Total: ₦${total.toFixed(2)}\n\nWould you like to pay now?\n\n1 - Pay with Paystack\n0 - Cancel payment\n\nOr would you like to place a new order?\n\n2 - Place a new order`;
          }
        }
        break;
      }

      case '98': {
        const orders = await getOrderHistory(deviceId);
        
        if (orders.length === 0) {
          response = `Your order history:\n\nNo previous orders found.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
        } else {
          let historyText = 'Your order history:\n\n';
          
          for (const order of orders) {
            const items = order.items || [];
            const total = items.reduce((sum, itemId) => {
              const item = menuItems.find(i => i.id === parseInt(itemId));
              return sum + (item ? item.price : 0);
            }, 0);
            
            const itemNames = items.map(itemId => {
              const item = menuItems.find(i => i.id === parseInt(itemId));
              return item ? item.name : 'Unknown item';
            }).join(', ');
            
            historyText += `Order #${order.id} (${order.status}):\n`;
            historyText += `Items: ${itemNames}\n`;
            historyText += `Total: ₦${total.toFixed(2)}\n`;
            if (order.scheduledFor) {
              historyText += `Scheduled for: ${order.scheduledFor}\n`;
            }
            historyText += '\n';
          }
          
          historyText += 'Would you like to place a new order?\n\n1 - Place a new order';
          response = historyText;
        }
        break;
      }

      case '97': {
        if (!currentOrder) {
          response = `Your current order:\n\nNo active order.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
        } else {
          const items = currentOrder.items || [];
          const total = items.reduce((sum, itemId) => {
            const item = menuItems.find(i => i.id === parseInt(itemId));
            return sum + (item ? item.price : 0);
          }, 0);
          
          if (items.length === 0) {
            response = `Your current order is empty.\n\nWould you like to add items?\n\n1 - Add items\n0 - Cancel order`;
          } else {
            const itemNames = items.map(itemId => {
              const item = menuItems.find(i => i.id === parseInt(itemId));
              return item ? item.name : 'Unknown item';
            }).join(', ');
            
            response = `Your current order:\n\nItems: ${itemNames}\nTotal: ₦${total.toFixed(2)}\n\nWould you like to checkout?\n\n99 - Checkout\n1 - Add more items\n0 - Cancel order`;
          }
        }
        break;
      }

      case '0': {
        if (!currentOrder) {
          response = `No active order to cancel.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
        } else {
          await prisma.order.update({
            where: { id: currentOrder.id },
            data: { status: 'cancelled' }
          });
          
          response = `Your order has been cancelled.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
        }
        break;
      }

      case '96': {
        if (!currentOrder) {
          response = `No active order to schedule.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
        } else {
          response = `Please enter the date and time you would like to schedule your order for (e.g., "2024-03-25 18:00").`;
        }
        break;
      }

      default: {
        // Check if the message is a number (menu item selection)
        const itemId = parseInt(message);
        
        if (!isNaN(itemId) && itemId >= 1 && itemId <= menuItems.length) {
          if (!currentOrder) {
            response = `No active order. Please start a new order first.\n\n1 - Place a new order`;
          } else {
            // Add item to order
            const items = currentOrder.items || [];
            items.push(itemId.toString());
            
            await prisma.order.update({
              where: { id: currentOrder.id },
              data: { items }
            });
            
            const item = menuItems.find(i => i.id === itemId);
            const total = items.reduce((sum, itemId) => {
              const item = menuItems.find(i => i.id === parseInt(itemId));
              return sum + (item ? item.price : 0);
            }, 0);
            
            response = `${item.name} added to your order. Current total: ₦${total.toFixed(2)}\n\nWould you like to add more items or checkout?\n\n1 - Add more items\n99 - Checkout order\n0 - Cancel order`;
          }
        } else if (message.trim() === '0') {
          if (currentOrder) {
            await prisma.order.update({
              where: { id: currentOrder.id },
              data: { status: 'cancelled' }
            });
            
            response = `Your order has been cancelled.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
          } else {
            response = `No active order to cancel.\n\nWould you like to place a new order?\n\n1 - Place a new order`;
          }
        } else if (message.trim() === '2') {
          const menuText = menuItems.map(item => 
            `${item.id}. ${item.name} - ₦${item.price.toFixed(2)}`
          ).join('\n');
          
          response = `Great! What would you like to order?\n\nAvailable items:\n${menuText}\n\nPlease enter the number of the item you want to order.`;
        } else {
          response = `I didn't understand that. Please select a valid option:\n\n1 - Place an Order (or add items if order is active)\n99 - Checkout Order\n98 - See Order History\n97 - See Current Order\n0 - Cancel Order\n96 - Schedule Order (optional)`;
        }
        break;
      }
    }

    return res.json({ response });
  } catch (error) {
    console.error('Error handling chat:', error);
    return res.status(500).json({ response: 'An error occurred while processing your request.' });
  }
};
module.exports = { handleChat };