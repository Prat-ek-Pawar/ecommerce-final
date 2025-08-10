const pendingApprovalTemplate = ({ vendor, approveLink, denyLink }) => {
  // ✅ Extract category names from populated productCategory
  const categoryNames =
    vendor.productCategory && vendor.productCategory.length > 0
      ? vendor.productCategory.map((cat) => cat.name).join(", ")
      : "Not specified";

  console.log("Categories for email template:", categoryNames);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Vendor Registration - Approval Required</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
            color: #334155;
        }
        .email-container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 26px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .alert {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .alert-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .alert-text {
            color: #92400e;
            font-weight: 600;
            font-size: 16px;
        }
        .vendor-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .vendor-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .vendor-icon {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 15px;
        }
        .vendor-title {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .info-value {
            color: #1e293b;
            font-size: 14px;
            font-weight: 500;
            word-break: break-word;
        }
        .category-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .category-tag {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        .description-section {
            margin-top: 20px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .description-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .description-text {
            color: #1e293b;
            font-size: 14px;
            line-height: 1.6;
        }
        .action-section {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 30px;
            margin: 30px 0;
            border-radius: 12px;
            text-align: center;
        }
        .action-title {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .button-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            min-width: 140px;
        }
        .btn-approve {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .btn-approve:hover {
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            transform: translateY(-1px);
        }
        .btn-deny {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .btn-deny:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            transform: translateY(-1px);
        }
        .footer {
            background-color: #f8fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 5px;
        }
        .timestamp {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-size: 13px;
            color: #64748b;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .content, .header, .footer {
                padding: 20px;
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
            .button-container {
                flex-direction: column;
                align-items: center;
            }
            .btn {
                width: 100%;
                max-width: 250px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🏪 New Vendor Registration</h1>
            <p>Action Required - Approval Pending</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Alert -->
            <div class="alert">
                <div class="alert-icon">⚠️</div>
                <div class="alert-text">A new vendor is waiting for approval</div>
            </div>

            <!-- Vendor Information Card -->
            <div class="vendor-card">
                <div class="vendor-header">
                    <div class="vendor-icon">🏢</div>
                    <div class="vendor-title">${vendor.companyName}</div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">${vendor.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">${
                          vendor.phone || "Not provided"
                        }</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Product Categories</div>
                        <div class="info-value">${categoryNames}</div>
                        <div class="category-tags">
                            ${vendor.productCategory
                              .map(
                                (cat) =>
                                  `<span class="category-tag">${cat.name}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Registration Date</div>
                        <div class="info-value">${new Date().toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}</div>
                    </div>
                </div>

                <div class="description-section">
                    <div class="description-label">Company Description</div>
                    <div class="description-text">${vendor.description}</div>
                </div>
            </div>

            <!-- Action Section -->
            <div class="action-section">
                <div class="action-title">🎯 Take Action Now</div>
                <div class="button-container">
                    <a href="${approveLink}" class="btn btn-approve">
                        ✅ Approve Vendor
                    </a>
                    <a href="${denyLink}" class="btn btn-deny">
                        ❌ Deny Application
                    </a>
                </div>
            </div>

            <div class="timestamp">
                <strong>Timestamp:</strong> ${new Date().toISOString()}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Note:</strong> These approval links are secure and single-use only.</p>
            <p>This email was automatically generated by the E-Commerce Platform.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = pendingApprovalTemplate;
