const vendorApprovedTemplate = (name = "Vendor") => {
  return `
    <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:20px;font-family:sans-serif;background-color:#e9fff1;">
      <h2 style="text-align:center;color:#2e7d32;">🎉 Approval Confirmed</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your vendor account has been <strong>approved</strong> by our team. You can now log in and start uploading your products.</p>
      <p>We're excited to have you on board!</p>
      <p style="font-size:12px;color:#888;margin-top:20px;text-align:center;">If you did not initiate this registration, please ignore this email.</p>
    </div>
  `;
};

module.exports = vendorApprovedTemplate;
