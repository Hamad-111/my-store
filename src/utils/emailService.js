import emailjs from '@emailjs/browser';

// ⚠️ REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
const SERVICE_ID = 'service_7dbcz6e';
const TEMPLATE_ID = 'template_hau4nkl';
const PUBLIC_KEY = '9VeznDyWSso6zb8ta';

/**
 * Sends an order confirmation email to the customer.
 * 
 * @param {Object} order - The order object containing details.
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise.
 */
export const sendOrderConfirmationEmail = async (order) => {
    try {
        if (!order || !order.shipping_address || !order.shipping_address.email) {
            console.warn('Order or email missing, cannot send confirmation.');
            return false;
        }

        const templateParams = {
            customer_name: order.shipping_address.fullName,
            to_email: order.shipping_address.email,
            order_id: order.id,
            total_amount: order.total_amount,
            message: 'Your order has been confirmed! We are processing it now.',
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log('SUCCESS!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('FAILED...', error);
        alert('Failed to send confirmation email. Check console for details.');
        return false;
    }
};
