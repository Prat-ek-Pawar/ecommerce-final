const vendorDeniedTemplate = (name = "Vendor") => {
  return `
    <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:20px;font-family:sans-serif;background-color:#fff0f0;">
      <h2 style="text-align:center;color:#d32f2f;">🚫 Request Denied</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We regret to inform you that your vendor application has been <strong>denied</strong> after careful review. You may contact us for further clarification or reapply with updated details.</p>
      <p style="font-size:12px;color:#888;margin-top:20px;text-align:center;">We appreciate your interest in partnering with us.</p>
    </div>
  `;
};

module.exports = vendorDeniedTemplate;
