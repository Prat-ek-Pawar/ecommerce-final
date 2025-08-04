const orderPlacedTemplate = ({
  orderId,
  customerName = "Customer",
  productName,
}) => {
  return `
    <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:20px;font-family:sans-serif;background-color:#f0f8ff;">
      <h2 style="text-align:center;color:#1976d2;">📦 Order Confirmation</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Thank you for your order! Your order <strong>#${orderId}</strong> for <strong>${productName}</strong> has been placed successfully.</p>
      <p>You’ll receive another email once your order is shipped.</p>
      <p style="font-size:12px;color:#888;margin-top:20px;text-align:center;">We appreciate your business. If you have any questions, feel free to reach out.</p>
    </div>
  `;
};

module.exports = orderPlacedTemplate;
