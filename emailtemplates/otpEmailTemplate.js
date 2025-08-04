const otpEmailTemplate = (otp, companyName = "User") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Your OTP Code</title>
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 28px;
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
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .otp-container {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #1e293b;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background-color: #ffffff;
            padding: 15px 25px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .validity {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
            text-align: center;
        }
        .validity-icon {
            font-size: 20px;
            margin-right: 8px;
        }
        .validity-text {
            font-size: 14px;
            color: #92400e;
            font-weight: 500;
        }
        .security-note {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .security-note h3 {
            color: #0c4a6e;
            font-size: 16px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .security-note p {
            color: #0369a1;
            font-size: 14px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 8px;
        }
        .company-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .company-name {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 5px;
        }
        .company-tagline {
            font-size: 13px;
            color: #64748b;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 12px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Email Verification</h1>
            <p>Secure access to your vendor account</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello <strong>${companyName}</strong>! 👋
            </div>

            <div class="message">
                Thank you for choosing our platform! We've received a request to verify your email address for vendor registration. To complete the verification process, please use the One-Time Password (OTP) below:
            </div>

            <!-- OTP Container -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>

            <!-- Validity Warning -->
            <div class="validity">
                <span class="validity-icon">⏰</span>
                <span class="validity-text">This code expires in 2 minutes. Please use it immediately.</span>
            </div>

            <!-- Security Note -->
            <div class="security-note">
                <h3>🛡️ Security Notice</h3>
                <p>For your security, never share this OTP with anyone. Our team will never ask for your verification code via phone, email, or any other method.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p>This is an automated message, please do not reply to this email.</p>

            <div class="company-info">
                <div class="company-name">E-Commerce Platform</div>
                <div class="company-tagline">Connecting vendors and customers worldwide</div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = otpEmailTemplate;
