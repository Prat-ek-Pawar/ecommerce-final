"name": "Electronics"
},
"createdAt": "2024-01-15T10:30:00.000Z",
"stats": {
"totalProducts": 25,
"approvedProducts": 22
}
}
],
"query": "tech"
}

````

---

# 👤 Vendor Profile

## Get My Profile

**GET** `/api/vendor/profile/me`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "email": "vendor@example.com",
    "companyName": "Tech Solutions Inc",
    "description": "Leading tech solutions provider",
    "phone": "+1234567890",
    "address": {
      "street": "123 Tech Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "postalCode": "94105"
    },
    "productCategory": {
      "_id": "64a7b8c9d1234567890abcde",
      "name": "Electronics",
      "description": "Electronic devices and gadgets"
    },
    "avatar": {
      "url": "https://res.cloudinary.com/avatar.jpg",
      "public_id": "avatar_123"
    },
    "isApproved": true,
    "isLocked": false,
    "isActive": true,
    "maxProductLimit": 100,
    "subscription": {
      "currentPlan": "premium_6m",
      "duration": 6,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-07-01T00:00:00.000Z",
      "totalPurchases": 2
    },
    "stats": {
      "products": {
        "total": 25,
        "approved": 22,
        "pending": 2,
        "rejected": 1
      },
      "totalViews": 5420,
      "productLimit": {
        "used": 25,
        "total": 100,
        "remaining": 75,
        "percentage": 25
      }
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
````

---

## Update Profile

**PUT** `/api/vendor/profile/me`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "companyName": "Updated Tech Solutions Inc",
  "description": "Updated description",
  "phone": "+1234567891",
  "address": {
    "street": "456 New Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "postalCode": "94105"
  }
}
```

### Allowed Fields

| Field         | Type   | Constraints                              |
| ------------- | ------ | ---------------------------------------- |
| `companyName` | String | 2-100 characters                         |
| `description` | String | Max 1000 characters                      |
| `phone`       | String | Valid phone format                       |
| `address`     | Object | Street, city, state, country, postalCode |

### Response (200)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "companyName": "Updated Tech Solutions Inc",
    "description": "Updated description",
    "phone": "+1234567891",
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

---

## Get Vendor Dashboard

**GET** `/api/vendor/profile/dashboard`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "64a7b8c9d1234567890abcde",
      "companyName": "Tech Solutions Inc",
      "email": "vendor@example.com",
      "phone": "+1234567890",
      "description": "Leading tech solutions provider",
      "productCategory": {
        "_id": "64a7b8c9d1234567890abcde",
        "name": "Electronics"
      },
      "avatar": {
        "url": "https://res.cloudinary.com/avatar.jpg",
        "public_id": "avatar_123"
      },
      "isApproved": true,
      "isLocked": false,
      "maxProductLimit": 100,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "approvedAt": "2024-01-16T09:00:00.000Z"
    },
    "subscription": {
      "isActive": true,
      "daysRemaining": 150,
      "endDate": "2024-07-01T00:00:00.000Z",
      "startDate": "2024-01-01T00:00:00.000Z",
      "currentPlan": "premium_6m",
      "duration": 6,
      "isExpiringSoon": false,
      "status": "active"
    },
    "stats": {
      "products": {
        "total": 25,
        "approved": 22,
        "pending": 2,
        "rejected": 1
      },
      "totalViews": 5420,
      "productLimit": {
        "used": 25,
        "total": 100,
        "remaining": 75,
        "percentage": 25
      }
    },
    "recentProducts": [
      {
        "_id": "64a7b8c9d1234567890abcde",
        "title": "Gaming Laptop Pro",
        "slug": "gaming-laptop-pro",
        "images": [
          {
            "url": "/uploads/products/laptop.jpg",
            "public_id": "laptop_123"
          }
        ],
        "isApproved": true,
        "createdAt": "2024-01-14T10:30:00.000Z",
        "price": 1299.99,
        "views": 150,
        "category": {
          "_id": "64a7b8c9d1234567890abcde",
          "name": "Electronics"
        }
      }
    ],
    "recentActivity": [
      {
        "type": "login",
        "description": "Last login",
        "timestamp": "2024-01-15T08:30:00.000Z"
      },
      {
        "type": "profile_update",
        "description": "Profile last updated",
        "timestamp": "2024-01-14T15:20:00.000Z"
      }
    ]
  }
}
```

---

## Update Password

**PUT** `/api/vendor/profile/password`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword123!",
  "confirmPassword": "newSecurePassword123!"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Change Email

**PUT** `/api/vendor/profile/email`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword123"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Email updated successfully. Please verify your new email address.",
  "data": {
    "newEmail": "newemail@example.com",
    "emailVerified": false
  }
}
```

---

## Upload Avatar

**POST** `/api/vendor/profile/avatar`

**Access:** Private (Vendor Only)

**Content-Type:** `multipart/form-data`

### Form Data Fields

| Field    | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| `avatar` | File | Yes      | Image file  |

### Avatar Upload Specifications

**File Requirements:**

- **Maximum Files:** 1 avatar image
- **File Size Limit:** 5MB
- **Supported Formats:** JPEG, JPG, PNG, GIF, WebP
- **Field Name:** `avatar` (use this as the form field name)

**Image Handling:**

- Images are uploaded to Cloudinary
- Automatic image optimization and resizing
- Old avatar is automatically replaced
- Secure URL generation with public_id

**Security Measures:**

- File type validation on MIME type and extension
- Size limits to prevent abuse
- Cloudinary's built-in security features
- Automatic cleanup of old images

### Response (200)

```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "avatar": {
      "url": "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/avatars/avatar_abc123.jpg",
      "public_id": "avatars/avatar_abc123"
    }
  }
}
```

### Error Responses

| Status | Message                                             |
| ------ | --------------------------------------------------- |
| 400    | Please upload an image file                         |
| 400    | Avatar file too large. Maximum size is 5MB          |
| 400    | Only image files are allowed (JPEG, PNG, GIF, WebP) |
| 500    | Error uploading profile picture                     |

---

## Delete Avatar

**DELETE** `/api/vendor/profile/avatar`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

---

## Get Subscription Details

**GET** `/api/vendor/profile/subscription`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "data": {
    "currentPlan": "premium_6m",
    "duration": 6,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-07-01T00:00:00.000Z",
    "isActive": true,
    "daysRemaining": 150,
    "status": "active",
    "totalPurchases": 2,
    "lastPurchaseDate": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Get Account Status

**GET** `/api/vendor/profile/status`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "data": {
    "isActive": true,
    "isApproved": true,
    "isLocked": false,
    "emailVerified": true,
    "subscriptionStatus": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "approvedAt": "2024-01-16T09:00:00.000Z",
    "lastLogin": "2024-01-20T08:30:00.000Z",
    "deactivatedAt": null,
    "deactivationReason": null,
    "lockReason": null,
    "lockedAt": null
  }
}
```

---

## Deactivate Account

**PATCH** `/api/vendor/profile/deactivate`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "password": "currentPassword123",
  "reason": "Taking a break"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Account deactivated successfully. You can reactivate anytime by logging in."
}
```

---

## Reactivate Account

**PATCH** `/api/vendor/profile/reactivate`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "message": "Account reactivated successfully. Welcome back!",
  "data": {
    "isActive": true
  }
}
```

---

## Delete Account

**DELETE** `/api/vendor/profile/delete-account`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "password": "currentPassword123",
  "confirmDeletion": "DELETE_MY_ACCOUNT"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Account deleted successfully. We're sorry to see you go!"
}
```

> **⚠️ Warning:** This action permanently deletes the vendor account, all products, and associated data including images.

---

# 🛠️ Admin Management

## Get All Vendors

**GET** `/api/vendors/admin/all`

**Access:** Private (Super Admin Only)

### Query Parameters

| Parameter            | Type    | Default   | Description                                             |
| -------------------- | ------- | --------- | ------------------------------------------------------- |
| `page`               | Number  | 1         | Page number for pagination                              |
| `limit`              | Number  | 20        | Number of items per page                                |
| `isApproved`         | Boolean | -         | Filter by approval status                               |
| `isLocked`           | Boolean | -         | Filter by lock status                                   |
| `isActive`           | Boolean | -         | Filter by active status                                 |
| `category`           | String  | -         | Filter by category ID                                   |
| `search`             | String  | -         | Search in company name, email, description, phone       |
| `sortBy`             | String  | createdAt | Sort field                                              |
| `sortOrder`          | String  | desc      | Sort order (asc, desc)                                  |
| `subscriptionStatus` | String  | -         | Filter by subscription (active, expired, expiring_soon) |

### Example Request

```
GET /api/vendors/admin/all?page=1&limit=10&isApproved=true&subscriptionStatus=active&search=tech&sortBy=createdAt&sortOrder=desc
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "email": "vendor@example.com",
      "companyName": "Tech Solutions Inc",
      "description": "Leading tech solutions provider",
      "phone": "+1234567890",
      "productCategory": {
        "_id": "64a7b8c9d1234567890abcde",
        "name": "Electronics"
      },
      "avatar": {
        "url": "https://res.cloudinary.com/avatar.jpg",
        "public_id": "avatar_123"
      },
      "isApproved": true,
      "isLocked": false,
      "isActive": true,
      "maxProductLimit": 100,
      "subscription": {
        "currentPlan": "premium_6m",
        "duration": 6,
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-07-01T00:00:00.000Z"
      },
      "approvedBy": {
        "_id": "64a7b8c9d1234567890abcde",
        "username": "admin",
        "email": "admin@example.com"
      },
      "stats": {
        "totalProducts": 25,
        "approvedProducts": 22,
        "pendingProducts": 3,
        "totalViews": 5420,
        "productLimit": {
          "used": 25,
          "total": 100,
          "remaining": 75
        }
      },
      "subscriptionStatus": "active",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 95,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "total": 95,
    "approved": 80,
    "locked": 2,
    "active": 92,
    "expiredSubscriptions": 5
  }
}
```

---

## Get Single Vendor

**GET** `/api/vendors/admin/:vendorId`

**Access:** Private (Super Admin Only)

### Path Parameters

| Parameter  | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| `vendorId` | String | Yes      | Vendor ID   |

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "email": "vendor@example.com",
    "companyName": "Tech Solutions Inc",
    "description": "Leading tech solutions provider",
    "phone": "+1234567890",
    "productCategory": {
      "_id": "64a7b8c9d1234567890abcde",
      "name": "Electronics"
    },
    "stats": {
      "products": {
        "total": 25,
        "approved": 22,
        "pending": 2,
        "rejected": 1
      },
      "totalViews": 5420,
      "productLimit": {
        "used": 25,
        "total": 100,
        "remaining": 75,
        "percentage": 25
      }
    },
    "subscriptionInfo": {
      "currentPlan": "premium_6m",
      "duration": 6,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-07-01T00:00:00.000Z",
      "status": "active",
      "daysRemaining": 150
    },
    "recentProducts": [
      {
        "_id": "64a7b8c9d1234567890abcde",
        "title": "Gaming Laptop Pro",
        "slug": "gaming-laptop-pro",
        "isApproved": true,
        "createdAt": "2024-01-14T10:30:00.000Z",
        "price": 1299.99,
        "views": 150
      }
    ]
  }
}
```

---

## Update Vendor

**PUT** `/api/vendors/admin/:vendorId`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "companyName": "Updated Company Name",
  "description": "Updated description",
  "phone": "+1234567891",
  "productCategory": "64a7b8c9d1234567890abcde",
  "maxProductLimit": 150,
  "isApproved": true,
  "isLocked": false,
  "isActive": true
}
```

### Allowed Fields

| Field             | Type    | Constraints          |
| ----------------- | ------- | -------------------- |
| `companyName`     | String  | Min 2 characters     |
| `description`     | String  | Any length           |
| `phone`           | String  | Valid phone format   |
| `productCategory` | String  | Valid category ID    |
| `maxProductLimit` | Number  | 1-1000               |
| `isApproved`      | Boolean | Sets approval status |
| `isLocked`        | Boolean | Sets lock status     |
| `isActive`        | Boolean | Sets active status   |

### Response (200)

```json
{
  "success": true,
  "message": "Vendor updated successfully",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "companyName": "Updated Company Name",
    "description": "Updated description",
    "maxProductLimit": 150,
    "isApproved": true,
    "isLocked": false,
    "isActive": true,
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

---

## Delete Vendor

**DELETE** `/api/vendors/admin/:vendorId`

**Access:** Private (Super Admin Only)

### Response (200)

```json
{
  "success": true,
  "message": "Vendor and all associated data deleted successfully",
  "data": {
    "deletedVendor": {
      "id": "64a7b8c9d1234567890abcde",
      "companyName": "Tech Solutions Inc",
      "email": "vendor@example.com"
    },
    "deletedProducts": 25
  }
}
```

> **⚠️ Warning:** This permanently deletes the vendor, all products, and associated images.

---

## Update Subscription

**PATCH** `/api/vendors/admin/:vendorId/subscription`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "duration": 6,
  "maxProductLimit": 150,
  "startDate": "2024-01-15T00:00:00.000Z"
}
```

### Field Validation

| Field             | Type   | Required | Constraints           |
| ----------------- | ------ | -------- | --------------------- |
| `duration`        | Number | Yes      | 1, 3, 6, or 12 months |
| `maxProductLimit` | Number | No       | 1-1000                |
| `startDate`       | String | No       | ISO date string       |

### Response (200)

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscription": {
      "currentPlan": "premium_6m",
      "duration": 6,
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-07-15T00:00:00.000Z",
      "status": "active",
      "daysRemaining": 180
    },
    "maxProductLimit": 150,
    "isLocked": false
  }
}
```

---

## Approve/Reject Vendor

**PATCH** `/api/vendors/admin/:vendorId/approve`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "isApproved": true,
  "reason": "Optional rejection reason"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Vendor approved successfully",
  "data": {
    "id": "64a7b8c9d1234567890abcde",
    "companyName": "Tech Solutions Inc",
    "email": "vendor@example.com",
    "isApproved": true,
    "approvedAt": "2024-01-16T10:30:00.000Z",
    "approvedBy": {
      "_id": "64a7b8c9d1234567890admin",
      "username": "admin",
      "email": "admin@example.com"
    },
    "rejectionReason": null,
    "statusChanged": true
  }
}
```

---

## Toggle Lock Vendor

**PATCH** `/api/vendors/admin/:vendorId/toggle-lock`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "reason": "Suspicious activity",
  "force": false
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Vendor locked successfully",
  "data": {
    "id": "64a7b8c9d1234567890abcde",
    "companyName": "Tech Solutions Inc",
    "isLocked": true,
    "lockedAt": "2024-01-16T10:30:00.000Z",
    "lockReason": "Suspicious activity",
    "statusChanged": true
  }
}
```

---

## Bulk Approve Vendors

**PATCH** `/api/vendors/admin/bulk-approve`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "vendorIds": [
    "64a7b8c9d1234567890abcde",
    "64a7b8c9d1234567890abcdf",
    "64a7b8c9d1234567890abcda"
  ],
  "isApproved": true,
  "reason": "Optional rejection reason"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "3 vendors approved successfully",
  "data": {
    "matched": 3,
    "modified": 3,
    "action": "approved"
  }
}
```

---

## Bulk Update Subscription

**PATCH** `/api/vendors/admin/bulk-subscription`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "vendorIds": ["64a7b8c9d1234567890abcde", "64a7b8c9d1234567890abcdf"],
  "duration": 6,
  "maxProductLimit": 100
}
```

### Response (200)

```json
{
  "success": true,
  "message": "2 vendor subscriptions updated successfully",
  "data": {
    "processed": 2,
    "modified": 2,
    "duration": 6,
    "maxProductLimit": 100
  }
}
```

---

## Get Vendor Analytics

**GET** `/api/vendors/admin/analytics`

**Access:** Private (Super Admin Only)

### Query Parameters

| Parameter | Type   | Default | Description              |
| --------- | ------ | ------- | ------------------------ |
| `days`    | Number | 30      | Analytics period in days |

### Response (200)

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVendors": 150,
      "approvedVendors": 120,
      "activeVendors": 145,
      "lockedVendors": 3,
      "expiredSubscriptions": 8
    },
    "recentRegistrations": [
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "day": 15
        },
        "count": 5
      }
    ],
    "subscriptionBreakdown": [
      {
        "_id": "premium_6m",
        "count": 45,
        "totalRevenue": 90
      },
      {
        "_id": "basic_1m",
        "count": 30,
        "totalRevenue": 30
      }
    ],
    "topCategories": [
      {
        "_id": "64a7b8c9d1234567890abcde",
        "name": "Electronics",
        "vendorCount": 35
      }
    ],
    "period": "Last 30 days"
  }
}
```

---

## Get Subscription Statistics

**GET** `/api/vendors/admin/subscription-stats`

**Access:** Private (Super Admin Only)

### Response (200)

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVendors": 150,
      "activeSubscriptions": 140,
      "expiredSubscriptions": 8,
      "expiringSoon": 12,
      "totalRevenue": 450
    },
    "planBreakdown": [
      {
        "_id": "enterprise_12m",
        "count": 25,
        "revenue": 100
      },
      {
        "_id": "premium_6m",
        "count": 45,
        "revenue": 180
      },
      {
        "_id": "standard_3m",
        "count": 35,
        "revenue": 105
      },
      {
        "_id": "basic_1m",
        "count": 30,
        "revenue": 30
      }
    ],
    "expiringSoon": [
      {
        "_id": "64a7b8c9d1234567890abcde",
        "companyName": "Tech Solutions Inc",
        "email": "vendor@example.com",
        "subscription": {
          "endDate": "2024-01-22T00:00:00.000Z"
        },
        "daysRemaining": 3
      }
    ]
  }
}
```

---

# 🔧 Admin Approval System

## Approve Vendor via Email Link

**GET** `/api/admin/approve`

**Access:** No Authentication Required (Token-based)

### Query Parameters

| Parameter  | Type   | Required | Description             |
| ---------- | ------ | -------- | ----------------------- |
| `vendorId` | String | Yes      | Pending vendor ID       |
| `token`    | String | Yes      | One-time approval token |

### Example Request

```
GET /api/admin/approve?vendorId=64a7b8c9d1234567890abcde&token=abc123def456ghi789jkl012mno345pqr678
```

### Response

Admin will be redirected to a success page confirming the vendor has been approved and moved to the main vendor collection.

### Error Responses

- Invalid or expired token
- Vendor already processed
- Vendor not found

---

## Deny Vendor via Email Link

**GET** `/api/admin/deny`

**Access:** No Authentication Required (Token-based)

### Query Parameters

| Parameter  | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `vendorId` | String | Yes      | Pending vendor ID      |
| `token`    | String | Yes      | One-time denial token  |
| `reason`   | String | No       | Optional denial reason |

### Example Request

```
GET /api/admin/deny?vendorId=64a7b8c9d1234567890abcde&token=abc123def456ghi789jkl012mno345pqr678&reason=Incomplete documentation
```

### Response

Admin will be redirected to a confirmation page and the pending vendor record will be removed from the system.

---

# 📧 Email Workflow

## Vendor Registration Flow

1. **Vendor sends OTP request** → System sends OTP email to vendor
2. **Vendor completes signup** → System creates pending vendor record
3. **System sends approval email to admin** with approve/deny links
4. **Admin clicks approve/deny** → Vendor is either activated or rejected
5. **System sends confirmation email to vendor** about approval status

## Email Templates

- **OTP Email:** Contains 6-digit verification code (expires in 2 minutes)
- **Admin Approval Email:** Contains vendor details and approve/deny buttons
- **Vendor Confirmation Email:** Notifies vendor of approval/rejection status

## Security Features

### Authentication

- **Cookie-Based:** All authenticated requests use HTTP-only cookies
- **Role-Based Access:** Different endpoints for Vendors and Super Admins
- **Session Management:** Tokens expire after 30 days

### File Upload Security

- **File Type Validation:** Strict MIME type and extension checking
- **Size Limits:** 5MB per file to prevent abuse
- **Virus Scanning:** (If implemented)
- **Filename Sanitization:** Prevents directory traversal attacks

### Email-Based Workflow

- **OTP Verification:** 6-digit codes with 2-minute expiry
- **One-Time Tokens:** Secure approval/denial links with crypto-generated tokens
- **Rate Limiting:** Prevents OTP spam

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## API Features

### Pagination Support

- **Products:** Default 12 items, supports skip/limit
- **Categories:** Default 10 items, supports page/limit
- **Vendors:** Default 20 items, supports page/limit
- **All list endpoints:** Include total count and pagination metadata

### Search Capabilities

- **Full-Text Search:** Products support MongoDB text search with relevance scoring
- **Regex Search:** Categories and vendors use case-insensitive regex
- **Multi-Field Search:** Search across multiple fields simultaneously

### Filtering Options

- **Products:** By category, vendor, approval status, price range
- **Vendors:** By approval status, lock status, subscription status, category
- **Categories:** By name search
- **Admin Endpoints:** Advanced filtering with multiple criteria

### Sorting Options

- **Products:** By creation date, price,# 🚀 E-commerce API Documentation

**Base URL:** `https://ecommerce-final-tbrg.onrender.com`

---

## 📚 Table of Contents

- 🔐 [Authentication](#authentication)
- 📦 [Categories](#categories)
- 🛍️ [Products](#products)
- 👥 [Vendors](#vendors)
- 👤 [Vendor Profile](#vendor-profile)
- 🛠️ [Admin Management](#admin-management)
- 🔧 [Admin Approval System](#admin-approval-system)

---

# 🔐 Authentication

## Vendor Login

**POST** `/api/auth/vendor/login`

**Access:** Public

### Request Body

```json
{
  "email": "vendor@example.com",
  "password": "yourpassword"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "vendor": {
      "id": "64a7b8c9d1234567890abcde",
      "email": "vendor@example.com",
      "companyName": "Tech Solutions Inc",
      "phone": "+1234567890",
      "productCategory": {
        "_id": "64a7b8c9d1234567890abcdf",
        "name": "Electronics"
      },
      "role": "vendor",
      "subscription": {
        "duration": 12,
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.999Z",
        "isExpired": false,
        "daysRemaining": 120
      },
      "account": {
        "isLocked": false,
        "isApproved": true,
        "maxProductLimit": 100
      }
    }
  }
}
```

### Error Responses

| Status | Message                                                   |
| ------ | --------------------------------------------------------- |
| 400    | Please provide email and password                         |
| 401    | Invalid email or password                                 |
| 403    | Account pending approval. Please wait for admin approval. |

---

## Super Admin Login

**POST** `/api/auth/admin/login`

**Access:** Public

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Super Admin login successful",
  "data": {
    "admin": {
      "id": "64a7b8c9d1234567890abcde",
      "email": "admin@example.com",
      "username": "superadmin",
      "role": "superadmin",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## Get Current User

**GET** `/api/auth/me`

**Access:** Private (Vendor/Admin)

**Headers:** Cookie authentication required

### Response (200) - Vendor

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a7b8c9d1234567890abcde",
      "email": "vendor@example.com",
      "companyName": "Tech Solutions Inc",
      "phone": "+1234567890",
      "productCategory": {
        "_id": "64a7b8c9d1234567890abcdf",
        "name": "Electronics"
      },
      "role": "vendor",
      "subscription": {
        "duration": 12,
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.999Z",
        "isExpired": false,
        "daysRemaining": 120
      },
      "account": {
        "isLocked": false,
        "isApproved": true,
        "maxProductLimit": 100
      }
    }
  }
}
```

---

## Logout

**POST** `/api/auth/logout`

**Access:** Private (Vendor/Admin)

### Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Vendor Dashboard

**GET** `/api/auth/vendor/dashboard`

**Access:** Private (Vendor Only)

### Response (200)

```json
{
  "success": true,
  "message": "Welcome to vendor dashboard, Tech Solutions Inc!",
  "data": {
    "vendor": {
      "id": "64a7b8c9d1234567890abcde",
      "companyName": "Tech Solutions Inc",
      "email": "vendor@example.com",
      "subscription": {
        "duration": 12,
        "endDate": "2024-12-31T23:59:59.999Z",
        "isExpired": false
      },
      "isLocked": false,
      "maxProductLimit": 100
    },
    "subscriptionStatus": "active"
  }
}
```

---

## Admin Dashboard

**GET** `/api/auth/admin/dashboard`

**Access:** Private (Super Admin Only)

### Response (200)

```json
{
  "success": true,
  "message": "Welcome to admin dashboard, superadmin!",
  "data": {
    "admin": {
      "id": "64a7b8c9d1234567890abcde",
      "username": "superadmin",
      "email": "admin@example.com",
      "role": "superadmin"
    }
  }
}
```

---

# 📦 Categories

## Get All Categories

**GET** `/api/categories`

**Access:** Public

### Query Parameters

| Parameter | Type   | Default | Description                                  |
| --------- | ------ | ------- | -------------------------------------------- |
| `page`    | Number | 1       | Page number for pagination                   |
| `limit`   | Number | 10      | Number of items per page                     |
| `search`  | String | -       | Search categories by name (case-insensitive) |

### Example Request

```
GET /api/categories?page=1&limit=5&search=electronics
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "image": {
        "public_id": "categories/electronics_abc123",
        "url": "https://res.cloudinary.com/yourcloud/electronics.jpg"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 15
  }
}
```

---

## Get Category by ID

**GET** `/api/categories/:id`

**Access:** Public

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | String | Yes      | Category ID |

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image": {
      "public_id": "categories/electronics_abc123",
      "url": "https://res.cloudinary.com/yourcloud/electronics.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Create Category

**POST** `/api/categories`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "image": {
    "public_id": "categories/electronics_abc123",
    "url": "https://res.cloudinary.com/yourcloud/electronics.jpg"
  }
}
```

### Field Validation

| Field         | Type   | Required | Constraints                        |
| ------------- | ------ | -------- | ---------------------------------- |
| `name`        | String | Yes      | Unique, trimmed, min 1 character   |
| `description` | String | No       | Trimmed                            |
| `image`       | Object | No       | Must contain `public_id` and `url` |

### Response (201)

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image": {
      "public_id": "categories/electronics_abc123",
      "url": "https://res.cloudinary.com/yourcloud/electronics.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message                   |
| ------ | ------------------------- |
| 400    | Category name is required |
| 409    | Category already exists   |

---

## Update Category

**PUT** `/api/categories/:id`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "name": "Consumer Electronics",
  "description": "Updated description for electronic devices",
  "image": {
    "public_id": "categories/electronics_updated_xyz789",
    "url": "https://res.cloudinary.com/yourcloud/electronics_updated.jpg"
  }
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "name": "Consumer Electronics",
    "description": "Updated description for electronic devices",
    "image": {
      "public_id": "categories/electronics_updated_xyz789",
      "url": "https://res.cloudinary.com/yourcloud/electronics_updated.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

---

## Delete Category

**DELETE** `/api/categories/:id`

**Access:** Private (Super Admin Only)

### Response (200)

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

> ⚠️ **Note:** Future implementation will check if category is being used by vendors/products before allowing deletion.

---

# 🛍️ Products

## Get All Products

**GET** `/api/products`

**Access:** Public

### Query Parameters

| Parameter   | Type   | Default   | Description                                 |
| ----------- | ------ | --------- | ------------------------------------------- |
| `skip`      | Number | 0         | Number of records to skip                   |
| `limit`     | Number | 12        | Number of items per page                    |
| `search`    | String | -         | Search in title, description, keywords      |
| `category`  | String | -         | Filter by category ID                       |
| `sortBy`    | String | createdAt | Sort field (createdAt, price, views, title) |
| `sortOrder` | String | desc      | Sort order (asc, desc)                      |

### Example Request

```
GET /api/products?skip=0&limit=12&search=laptop&category=64a7b8c9d1234567890abcde&sortBy=price&sortOrder=asc
```

### Response (200)

```json
{
  "success": true,
  "total": 150,
  "count": 12,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "title": "Gaming Laptop Pro",
      "description": "High-performance gaming laptop with RTX graphics",
      "price": 1299.99,
      "images": [
        {
          "url": "/uploads/products/laptop-1234567890.jpg",
          "public_id": "laptop-1234567890",
          "index": 0
        }
      ],
      "category": {
        "_id": "64a7b8c9d1234567890abcdf",
        "name": "Electronics"
      },
      "vendor": {
        "_id": "64a7b8c9d1234567890abcde",
        "companyName": "Tech Solutions Inc",
        "avatar": {
          "url": "https://res.cloudinary.com/avatar.jpg",
          "public_id": "avatar_123"
        }
      },
      "keywords": ["gaming", "laptop", "RTX", "performance"],
      "views": 1250,
      "isApproved": true,
      "slug": "gaming-laptop-pro",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Enhanced Product Search

**GET** `/api/products/search`

**Access:** Public

### Query Parameters

| Parameter  | Type   | Default      | Description                                        |
| ---------- | ------ | ------------ | -------------------------------------------------- |
| `q`        | String | **Required** | Search query for full-text search                  |
| `category` | String | -            | Filter by category ID                              |
| `vendor`   | String | -            | Filter by vendor ID                                |
| `limit`    | Number | 20           | Number of items per page                           |
| `skip`     | Number | 0            | Number of records to skip                          |
| `sortBy`   | String | relevance    | Sort by (relevance, price_low, price_high, newest) |

### Example Request

```
GET /api/products/search?q=gaming laptop&category=64a7b8c9d1234567890abcde&sortBy=price_low&limit=10
```

### Response (200)

```json
{
  "success": true,
  "total": 25,
  "count": 10,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "title": "Gaming Laptop Pro",
      "score": 0.95,
      "price": 1299.99,
      "category": {
        "_id": "64a7b8c9d1234567890abcdf",
        "name": "Electronics"
      },
      "vendor": {
        "_id": "64a7b8c9d1234567890abcde",
        "companyName": "Tech Solutions Inc"
      }
    }
  ]
}
```

---

## Get Single Product

**GET** `/api/products/:id`

**Access:** Public

**Note:** Can use either product ID or slug

### Path Parameters

| Parameter | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| `id`      | String | Yes      | Product ID or slug |

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "title": "Gaming Laptop Pro",
    "description": "High-performance gaming laptop with RTX graphics",
    "price": 1299.99,
    "images": [
      {
        "url": "/uploads/products/laptop-1234567890.jpg",
        "public_id": "laptop-1234567890",
        "index": 0
      }
    ],
    "category": {
      "_id": "64a7b8c9d1234567890abcdf",
      "name": "Electronics"
    },
    "vendor": {
      "_id": "64a7b8c9d1234567890abcde",
      "companyName": "Tech Solutions Inc",
      "description": "Leading tech solutions provider",
      "avatar": {
        "url": "https://res.cloudinary.com/avatar.jpg",
        "public_id": "avatar_123"
      }
    },
    "keywords": ["gaming", "laptop", "RTX", "performance"],
    "views": 1251,
    "isApproved": true,
    "slug": "gaming-laptop-pro",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Get Products by Category

**GET** `/api/products/category/:categoryId`

**Access:** Public

### Path Parameters

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `categoryId` | String | Yes      | Category ID |

### Query Parameters

| Parameter | Type   | Default   | Description               |
| --------- | ------ | --------- | ------------------------- |
| `skip`    | Number | 0         | Number of records to skip |
| `limit`   | Number | 12        | Number of items per page  |
| `sortBy`  | String | createdAt | Sort field                |

### Example Request

```
GET /api/products/category/64a7b8c9d1234567890abcde?skip=0&limit=12&sortBy=price
```

---

## Get Products by Vendor

**GET** `/api/products/vendor/:vendorId`

**Access:** Public

### Path Parameters

| Parameter  | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| `vendorId` | String | Yes      | Vendor ID   |

### Query Parameters

| Parameter | Type   | Default | Description               |
| --------- | ------ | ------- | ------------------------- |
| `skip`    | Number | 0       | Number of records to skip |
| `limit`   | Number | 12      | Number of items per page  |

### Response (200)

```json
{
  "success": true,
  "total": 25,
  "count": 12,
  "data": [...],
  "vendor": {
    "id": "64a7b8c9d1234567890abcde",
    "companyName": "Tech Solutions Inc",
    "description": "Leading tech solutions provider",
    "avatar": {
      "url": "https://res.cloudinary.com/avatar.jpg",
      "public_id": "avatar_123"
    }
  }
}
```

---

## Create Product

**POST** `/api/products/create`

**Access:** Private (Vendor Only)

**Content-Type:** `multipart/form-data`

### Form Data Fields

| Field         | Type         | Required | Description                       |
| ------------- | ------------ | -------- | --------------------------------- |
| `title`       | String       | Yes      | Product title                     |
| `description` | String       | Yes      | Product description               |
| `category`    | String       | Yes      | Category ID                       |
| `keywords`    | String/Array | No       | Comma-separated keywords or array |
| `price`       | Number       | No       | Product price (default: 0)        |
| `images`      | File[]       | No       | Up to 5 image files               |

### Image Upload Specifications

**File Requirements:**

- **Maximum Files:** 5 images per product
- **File Size Limit:** 5MB per image
- **Supported Formats:** JPEG, JPG, PNG, GIF, WebP
- **Field Name:** `images` (use this as the form field name)

**Image Handling:**

- Images are stored locally in `/uploads/products/` directory
- Each image gets a unique filename with timestamp
- Images are automatically resized and optimized
- Original filename is preserved in metadata

**Security Measures:**

- File type validation on both MIME type and extension
- Virus scanning (if implemented)
- Filename sanitization to prevent directory traversal
- Size limits to prevent DOS attacks

### Example Form Data

```
title: Gaming Laptop Pro
description: High-performance gaming laptop with RTX graphics
category: 64a7b8c9d1234567890abcde
keywords: gaming,laptop,RTX,performance
price: 1299.99
images: [file1.jpg, file2.jpg, file3.jpg]
```

### Response (201)

```json
{
  "success": true,
  "message": "Product created successfully. It will be visible after approval.",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "title": "Gaming Laptop Pro",
    "description": "High-performance gaming laptop with RTX graphics",
    "category": "64a7b8c9d1234567890abcdf",
    "keywords": ["gaming", "laptop", "RTX", "performance"],
    "images": [
      {
        "url": "/uploads/products/images-1234567890-123456789.jpg",
        "public_id": "images-1234567890-123456789.jpg",
        "index": 0
      },
      {
        "url": "/uploads/products/images-1234567890-987654321.jpg",
        "public_id": "images-1234567890-987654321.jpg",
        "index": 1
      }
    ],
    "price": 1299.99,
    "vendor": "64a7b8c9d1234567890abcde",
    "isApproved": false,
    "slug": "gaming-laptop-pro",
    "views": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message                                             |
| ------ | --------------------------------------------------- |
| 400    | File too large. Maximum size is 5MB                 |
| 400    | Too many files. Maximum is 5 images                 |
| 400    | Only image files are allowed (JPEG, PNG, GIF, WebP) |
| 403    | Vendor not approved                                 |
| 403    | Vendor account is locked                            |
| 403    | Product limit reached. Maximum allowed: {limit}     |

---

## Get My Products

**GET** `/api/products/my-products`

**Access:** Private (Vendor Only)

### Query Parameters

| Parameter | Type   | Default   | Description                          |
| --------- | ------ | --------- | ------------------------------------ |
| `skip`    | Number | 0         | Number of records to skip            |
| `limit`   | Number | 20        | Number of items per page             |
| `status`  | String | -         | Filter by status (approved, pending) |
| `search`  | String | -         | Search in title, description         |
| `sortBy`  | String | createdAt | Sort field                           |

### Example Request

```
GET /api/products/my-products?skip=0&limit=10&status=pending&search=laptop
```

### Response (200)

```json
{
  "success": true,
  "total": 25,
  "count": 10,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "title": "Gaming Laptop Pro",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "category": {
        "_id": "64a7b8c9d1234567890abcdf",
        "name": "Electronics"
      },
      "isApproved": false,
      "views": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Update Product

**PUT** `/api/products/:id`

**Access:** Private (Vendor Only - Own Products)

### Request Body

```json
{
  "title": "Updated Gaming Laptop Pro",
  "description": "Updated description with new features",
  "category": "64a7b8c9d1234567890abcdf",
  "keywords": ["gaming", "laptop", "updated", "RTX"],
  "price": 1399.99
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Product updated. It will need re-approval.",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "title": "Updated Gaming Laptop Pro",
    "description": "Updated description with new features",
    "price": 1399.99,
    "isApproved": false,
    "approvalDate": null,
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

> **Note:** Updating title or description resets approval status and requires re-approval.

---

## Delete Product

**DELETE** `/api/products/:id`

**Access:** Private (Vendor Only - Own Products)

### Response (200)

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

> **Note:** Deletes product and all associated images from storage.

---

## Replace Product Image

**PUT** `/api/products/:productId/image`

**Access:** Private (Vendor Only)

### Request Body

```json
{
  "index": 0,
  "newImage": {
    "url": "/uploads/products/new-image-123456789.jpg",
    "public_id": "new-image-123456789.jpg"
  }
}
```

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "url": "/uploads/products/new-image-123456789.jpg",
      "public_id": "new-image-123456789.jpg",
      "index": 0
    }
  ]
}
```

---

## Delete Product Image

**DELETE** `/api/products/:productId/image`

**Access:** Private (Vendor Only)

### Query Parameters

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| `index`   | Number | Yes      | Index of image to delete |

### Example Request

```
DELETE /api/products/64a7b8c9d1234567890abcde/image?index=0
```

---

## Approve/Reject Product (Admin)

**PATCH** `/api/products/admin/:id/approve`

**Access:** Private (Super Admin Only)

### Request Body

```json
{
  "isApproved": true,
  "reason": "Optional rejection reason"
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Product approved successfully",
  "data": {
    "_id": "64a7b8c9d1234567890abcde",
    "title": "Gaming Laptop Pro",
    "isApproved": true,
    "approvalDate": "2024-01-16T10:30:00.000Z",
    "rejectionReason": null
  }
}
```

---

# 👥 Vendors

## Vendor Registration - Send OTP

**POST** `/api/vendor/send-otp`

**Access:** Public

### Request Body

```json
{
  "email": "vendor@example.com",
  "phone": "+1234567890",
  "companyName": "Tech Solutions Inc",
  "productCategory": "64a7b8c9d1234567890abcde",
  "description": "Leading tech solutions provider"
}
```

### Field Validation

| Field             | Type   | Required | Constraints                |
| ----------------- | ------ | -------- | -------------------------- |
| `email`           | String | Yes      | Valid email format, unique |
| `phone`           | String | No       | Valid phone number format  |
| `companyName`     | String | Yes      | Minimum 2 characters       |
| `productCategory` | String | Yes      | Valid category ID          |
| `description`     | String | Yes      | Company description        |

### Response (200)

```json
{
  "success": true,
  "message": "OTP sent to email successfully",
  "data": {
    "email": "vendor@example.com",
    "expiresIn": "2 minutes"
  }
}
```

### Error Responses

| Status | Message                                                               |
| ------ | --------------------------------------------------------------------- |
| 400    | All required fields must be filled                                    |
| 409    | Account with vendor@example.com already exists. Please login instead. |
| 409    | Vendor request already pending                                        |
| 429    | OTP already sent. Please wait before requesting again.                |

---

## Vendor Registration - Complete Signup

**POST** `/api/vendor/signup`

**Access:** Public

### Request Body

```json
{
  "email": "vendor@example.com",
  "otp": "123456",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "phone": "+1234567890",
  "companyName": "Tech Solutions Inc",
  "productCategory": "64a7b8c9d1234567890abcde",
  "description": "Leading tech solutions provider"
}
```

### Field Validation

| Field             | Type   | Required | Constraints                                             |
| ----------------- | ------ | -------- | ------------------------------------------------------- |
| `email`           | String | Yes      | Must match OTP request email                            |
| `otp`             | String | Yes      | 6-digit OTP code                                        |
| `password`        | String | Yes      | Min 8 chars, uppercase, lowercase, number, special char |
| `confirmPassword` | String | Yes      | Must match password                                     |
| `phone`           | String | No       | Valid phone number format                               |
| `companyName`     | String | Yes      | Minimum 2 characters                                    |
| `productCategory` | String | Yes      | Valid category ID                                       |
| `description`     | String | Yes      | Company description                                     |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Response (201)

```json
{
  "success": true,
  "message": "Vendor registration submitted successfully! Please wait for admin approval.",
  "data": {
    "vendorId": "64a7b8c9d1234567890abcde",
    "companyName": "Tech Solutions Inc",
    "email": "vendor@example.com",
    "status": "pending_approval",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Message                                                 |
| ------ | ------------------------------------------------------- |
| 400    | All required fields must be filled                      |
| 400    | Password validation failed: [specific requirements]     |
| 400    | Passwords do not match                                  |
| 400    | Invalid OTP format. Please enter 6 digits.              |
| 400    | Invalid or expired OTP. Please request a new one.       |
| 409    | Email already registered. Please use a different email. |

---

## Search Vendors

**GET** `/api/vendor/search`

**Access:** Public

### Query Parameters

| Parameter      | Type    | Default      | Description                |
| -------------- | ------- | ------------ | -------------------------- |
| `q`            | String  | **Required** | Search query               |
| `category`     | String  | -            | Filter by category ID      |
| `limit`        | Number  | 10           | Number of items per page   |
| `includeStats` | Boolean | false        | Include product statistics |

### Example Request

```
GET /api/vendor/search?q=tech&category=64a7b8c9d1234567890abcde&includeStats=true&limit=5
```

### Response (200)

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64a7b8c9d1234567890abcde",
      "companyName": "Tech Solutions Inc",
      "description": "Leading tech solutions provider",
      "avatar": {
        "url": "https://res.cloudinary.com/avatar.jpg",
        "public_id": "avatar_123"
      },
      "productCategory": {
        "_id": "64a7b8c9d1234567890abcde",
```
# Create Vendor API Documentation

## Route
```
POST /api/vendor/admin/create-vendor
```

## Authentication
- **Required**: Super Admin authentication
- **Method**: Include JWT token in cookie named `token` OR Authorization header
- **Cookie**: `token=your_jwt_token_here`
- **Header**: `Authorization: Bearer your_jwt_token_here`

## Request Body Structure

### Required Fields
```json
{
  "email": "vendor@example.com",
  "password": "SecurePass123!",
  "companyName": "ABC Company Ltd",
  "productCategory": "64f5b2c3d1e2a3b4c5d6e7f8"
}
```

### Complete Request Body (All Fields)
```json
{
  "email": "vendor@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "companyName": "ABC Company Ltd",
  "address": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "description": "We are a leading supplier of electronics and gadgets",
  "productCategory": "64f5b2c3d1e2a3b4c5d6e7f8",
  "avatar": {
    "url": "https://example.com/avatar.jpg",
    "public_id": "avatar_123"
  },
  "subscription": {
    "duration": 3
  },
  "maxProductLimit": 25,
  "isApproved": true
}
```

## Field Validation Rules

### Email
- **Required**: Yes
- **Format**: Valid email format
- **Unique**: Must not exist in database
- **Example**: `"vendor@company.com"`

### Password
- **Required**: Yes
- **Minimum Length**: 8 characters
- **Must Contain**:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (@$!%*?&)
- **Example**: `"SecurePass123!"`

### Phone
- **Required**: No
- **Format**: International format accepted
- **Example**: `"+1234567890"` or `"1234567890"`

### Company Name
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Example**: `"ABC Electronics Ltd"`

### Address (Optional Object)
```json
{
  "street": "123 Business Ave", // Max 200 chars
  "city": "New York",           // Max 50 chars
  "state": "NY",                // Max 50 chars
  "country": "USA",             // Max 50 chars
  "postalCode": "10001"         // Max 20 chars
}
```

### Product Category
- **Required**: Yes
- **Type**: Valid MongoDB ObjectId
- **Reference**: Must exist in Categories collection
- **Example**: `"64f5b2c3d1e2a3b4c5d6e7f8"`

### Subscription
- **Required**: No (defaults to 1 month)
- **Duration Options**: 1, 3, 6, or 12 months
- **Default Plan Mapping**:
  - 1 month → "basic_1m"
  - 3 months → "standard_3m"
  - 6 months → "premium_6m"
  - 12 months → "enterprise_12m"

### Avatar (Optional)
```json
{
  "url": "https://cloudinary.com/image.jpg",
  "public_id": "avatar_cloudinary_id"
}
```

### Max Product Limit
- **Required**: No
- **Default**: 10
- **Range**: 1-1000
- **Example**: `25`

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "vendor": {
      "_id": "64f5b2c3d1e2a3b4c5d6e7f9",
      "email": "vendor@example.com",
      "companyName": "ABC Company Ltd",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postalCode": "10001"
      },
      "description": "Leading electronics supplier",
      "productCategory": {
        "_id": "64f5b2c3d1e2a3b4c5d6e7f8",
        "name": "Electronics"
      },
      "avatar": {
        "url": "https://example.com/avatar.jpg",
        "public_id": "avatar_123"
      },
      "isActive": true,
      "isApproved": true,
      "isLocked": false,
      "approvedBy": "64f5b2c3d1e2a3b4c5d6e7f0",
      "approvedAt": "2024-01-15T10:30:00.000Z",
      "emailVerified": true,
      "maxProductLimit": 25,
      "subscription": {
        "duration": 3,
        "startDate": "2024-01-15T10:30:00.000Z",
        "endDate": "2024-04-15T10:30:00.000Z",
        "currentPlan": "standard_3m",
        "totalPurchases": 0,
        "lastPurchaseDate": "2024-01-15T10:30:00.000Z"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "error": "Missing required fields: email, companyName"
}
```

#### 400 Bad Request - Invalid Password
```json
{
  "success": false,
  "error": "Password validation failed: Password must contain at least one uppercase letter, Password must contain at least one number"
}
```

#### 400 Bad Request - Duplicate Email
```json
{
  "success": false,
  "error": "Vendor already registered with this email"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Super Admin access required."
}
```

## Frontend Implementation Example

### JavaScript/Fetch
```javascript
const createVendor = async (vendorData) => {
  try {
    const response = await fetch('/api/vendor/admin/create-vendor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include token in header if not using cookies
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(vendorData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create vendor');
    }

    return result;
  } catch (error) {
    console.error('Create vendor error:', error);
    throw error;
  }
};
```

### React/Axios Example
```javascript
import axios from 'axios';

const createVendor = async (vendorData) => {
  try {
    const response = await axios.post('/api/vendor/admin/create-vendor', vendorData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      withCredentials: true // Include cookies
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## Common Issues & Solutions

### 1. Authentication Errors
- **Issue**: "Access denied. No token provided."
- **Solution**: Ensure JWT token is included in cookie or Authorization header
- **Check**: Token should be named exactly `token` in cookies

### 2. Password Validation Errors
- **Issue**: Password doesn't meet requirements
- **Solution**: Ensure password has:
  - 8+ characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number
  - 1 special character (@$!%*?&)

### 3. Missing Fields
- **Issue**: "Missing required fields"
- **Solution**: Ensure all required fields are provided:
  - email
  - password
  - companyName
  - productCategory

### 4. Invalid Product Category
- **Issue**: Category validation fails
- **Solution**: Use valid MongoDB ObjectId that exists in Categories collection

### 5. Duplicate Email
- **Issue**: "Vendor already registered with this email"
- **Solution**: Use a different email address or check existing vendor

--------------------------------------Pending Vendor Approval Denial from dashboard--------------------
# Admin Routes API Documentation

This documentation covers all admin routes for vendor approval management in the system.

## Base URL
```
/api/admin
```

## Authentication Requirements

Most routes require Super Admin authentication. Include the JWT token in:
- **Cookie**: `token=your_jwt_token` (Recommended)
- **Header**: `Authorization: Bearer your_jwt_token`

## Routes Overview

### 1. Email-Based Vendor Approval/Denial
These routes are triggered from email links and don't require authentication.

### 2. Admin Dashboard Routes
These routes require Super Admin authentication for manual vendor management.

---

## 📧 Email-Based Routes (No Auth Required)

### Approve Vendor via Email Link
everything handled on backend

**Description**: Approves a pending vendor application via email verification link.

---

### Deny Vendor via Email Link
Handled on backed


## 🛡️ Protected Admin Routes (Super Admin Auth Required)

### Get All Pending Vendors
```http
GET /api/admin/pending-list
```

**Description**: Retrieves a list of all pending vendor applications.

**Authentication**: Required (Super Admin)

**Response**:
```json
{
  "message": "succes",
  "data": [
    {
      "_id": "6892e7fe5c398bd5f170357c",
      "email": "vendor@example.com",
      "companyName": "ABC Company",
      "phone": "+1234567890",
      "productCategory": ["category_id"],
      "description": "Company description",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Access denied. Super Admin access required."
}
```

---

### Approve Vendor by ID
```http
POST /api/admin/approve-vendor/{id}
```

**Description**: Manually approves a pending vendor by their ID.

**Authentication**: Required (Super Admin)

**URL Parameters**:
- `id` (string): The pending vendor ID

**Success Response**:
```json
{
  "message": "Vendor approved successfully",
  "vendor": {
    "id": "6892e7fe5c398bd5f170357c",
    "companyName": "ABC Company",
    "email": "vendor@example.com",
    "subscriptionEndDate": "Mon Feb 15 2025"
  }
}
```

**Error Responses**:
```json
{
  "message": "Pending vendor not found"
}
```
```json
{
  "message": "Can't approve vendor, try again later",
  "error": "Detailed error message"
}
```

**What this route does**:
- ✅ Creates a new vendor account with 1-month free subscription
- ✅ Sets up basic subscription plan (10 product limit)
- ✅ Transfers all data from pending vendor
- ✅ Removes vendor from pending list
- ✅ Account is immediately active and unlocked

---

### Deny Vendor by ID
```http
POST /api/admin/deny-vendor/{id}
```

**Description**: Manually denies a pending vendor by their ID.

**Authentication**: Required (Super Admin)

**URL Parameters**:
- `id` (string): The pending vendor ID

**Success Response**:
```json
{
  "message": "Vendor removed from pending list"
}
```

**Error Response**:
```json
{
  "message": "cant deny vendor try again later"
}
```

**What this route does**:
- ❌ Permanently removes vendor from pending list
- ❌ No vendor account is created
- ❌ Vendor cannot reapply with same data

---

### Clear All Pending Vendors
```http
POST /api/admin/clear-pending
```

**Description**: Removes all pending vendor applications from the system.

**Authentication**: Required (Super Admin)

**Success Response**:
```json
{
  "message": "Pending list cleared"
}
```

**⚠️ Warning**: This action is irreversible and removes ALL pending applications.

---

## 🔒 Authentication Details

### Super Admin Login
Before using protected routes, authenticate via:
```http
POST /api/auth/admin/login
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Super Admin login successful",
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "username": "admin",
      "role": "superadmin",
      "token": "jwt_token_here"
    }
  }
}
```

### Using Authentication Token

**Option 1: Cookie (Recommended)**
The token is automatically set as an httpOnly cookie. No additional setup needed for same-origin requests.

**Option 2: Authorization Header**
```javascript
fetch('/api/admin/pending-list', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 📝 Frontend Implementation Examples

### React Hook for Pending Vendors
```javascript
import { useState, useEffect } from 'react';

const usePendingVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingVendors = async () => {
    try {
      const response = await fetch('/api/admin/pending-list');
      const data = await response.json();

      if (response.ok) {
        setVendors(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id) => {
    try {
      const response = await fetch(`/api/admin/approve-vendor/${id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        // Remove from pending list
        setVendors(prev => prev.filter(v => v._id !== id));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to approve vendor' };
    }
  };

  const denyVendor = async (id) => {
    try {
      const response = await fetch(`/api/admin/deny-vendor/${id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        // Remove from pending list
        setVendors(prev => prev.filter(v => v._id !== id));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to deny vendor' };
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  return { vendors, loading, error, approveVendor, denyVendor, refetch: fetchPendingVendors };
};
```

### Admin Dashboard Component
```javascript
import React from 'react';

const AdminDashboard = () => {
  const { vendors, loading, error, approveVendor, denyVendor } = usePendingVendors();

  const handleApprove = async (id, companyName) => {
    if (confirm(`Approve ${companyName}?`)) {
      const result = await approveVendor(id);
      alert(result.message);
    }
  };

  const handleDeny = async (id, companyName) => {
    if (confirm(`Deny ${companyName}? This action cannot be undone.`)) {
      const result = await denyVendor(id);
      alert(result.message);
    }
  };

  if (loading) return <div>Loading pending vendors...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <h2>Pending Vendor Applications ({vendors.length})</h2>

      {vendors.length === 0 ? (
        <p>No pending applications</p>
      ) : (
        <div className="vendor-list">
          {vendors.map(vendor => (
            <div key={vendor._id} className="vendor-card">
              <h3>{vendor.companyName}</h3>
              <p>Email: {vendor.email}</p>
              <p>Phone: {vendor.phone}</p>
              <p>Applied: {new Date(vendor.createdAt).toLocaleDateString()}</p>

              <div className="actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(vendor._id, vendor.companyName)}
                >
                  ✅ Approve
                </button>
                <button
                  className="deny-btn"
                  onClick={() => handleDeny(vendor._id, vendor.companyName)}
                >
                  ❌ Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Important Notes

1. **Email-based routes** (`/approve` and `/deny`) are designed for email links and return HTML pages
2. **Admin routes** (`/approve-vendor/:id` and `/deny-vendor/:id`) are for dashboard use and return JSON
3. **Authentication** is required for all admin dashboard routes
4. **Vendor approval** creates a 1-month free subscription automatically
5. **Error handling** should be implemented for all network requests
6. **Confirmation dialogs** are recommended for destructive actions (deny/clear)

## 🔄 Status Codes

- `200` - Success
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (vendor doesn't exist)
- `500` - Server error

## 📧 Email Integration

The system automatically sends email notifications:
- ✅ **Approval email** when vendor is approved
- ❌ **Denial email** when vendor is denied

Make sure email templates and SMTP configuration are properly set up in your environment.

## Get featured products
GET /api/products/featured
{
  "success": true,
  "count": 3,
  "data": [
    { "_id": "64f9...", "name": "Product A", "isFeatured": true },
    { "_id": "64f8...", "name": "Product B", "isFeatured": true }
  ]
}
## toggle featured
PATCH /api/products/:id/featured

only super admin add http headers
PATCH /api/products/64f9abc12345/featured
{
  "success": true,
  "message": "Product isFeatured set to true",
  "data": {
    "_id": "64f9abc12345",
    "name": "Product A",
    "isFeatured": true
  }
}


--------------------Customers-------------------------------
# 🛒 Customers API Documentation

## 📍 Base Route
```javascript
app.use("/api/customer", customerRoutes)
```

**Base URL:** `https://your-domain.com/api/customer`

---

## 🌐 PUBLIC ROUTES (No Authentication Required)

### 1. Create Customer Order
```http
POST /api/customer
```

**Access:** Public (Anyone can place orders)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "vendorId": "68982d7316eb32315a363a86",
  "productId": "68982d7316eb32315a363a87",
  "quantity": 2,
  "email": "customer@example.com",
  "number": "+1234567890",
  "name": "John Doe",
  "address": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Field Validations:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `vendorId` | String | Yes | Valid MongoDB ObjectId |
| `productId` | String | Yes | Valid MongoDB ObjectId |
| `quantity` | Number | Yes | Positive integer ≥ 1 |
| `email` | String | Yes | Valid email format |
| `number` | String | Yes | Valid phone number |
| `name` | String | Yes | 2-100 characters |
| `address.street` | String | Yes | Required |
| `address.city` | String | Yes | Required |
| `address.state` | String | Yes | Required |
| `address.zipCode` | String | Yes | Required |
| `address.country` | String | No | Defaults to "India" |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "customer": {
      "_id": "659f1234567890abcdef1234",
      "vendorId": {
        "_id": "68982d7316eb32315a363a86",
        "companyName": "Tech Solutions Inc",
        "email": "vendor@example.com",
        "phone": "+1234567890"
      },
      "productId": {
        "_id": "68982d7316eb32315a363a87",
        "title": "Gaming Laptop Pro",
        "price": 1299.99,
        "images": [
          {
            "url": "/uploads/products/laptop.jpg",
            "public_id": "laptop_123"
          }
        ]
      },
      "quantity": 2,
      "email": "customer@example.com",
      "number": "+1234567890",
      "name": "John Doe",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "deliveredFlag": false,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "orderTime": "10:30:00",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "orderDetails": {
      "orderId": "659f1234567890abcdef1234",
      "customerName": "John Doe",
      "productName": "Gaming Laptop Pro",
      "vendorName": "Tech Solutions Inc",
      "quantity": 2,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "orderTime": "10:30:00",
      "status": "Pending",
      "fullAddress": "123 Main Street, New York, NY 10001, USA"
    }
  }
}
```

**Error Responses:**
```json
// Missing fields
{
  "success": false,
  "error": "Missing required fields: vendorId, productId"
}

// Invalid vendor/product
{
  "success": false,
  "error": "Vendor not found"
}

// Validation error
{
  "success": false,
  "error": "Quantity must be a positive whole number"
}
```

### 2. Get Order by ID
```http
GET /api/customer/:id
```

**Access:** Public

**Parameters:**
- `id` (String): Order ID (MongoDB ObjectId)

**Example:**
```
GET /api/customer/659f1234567890abcdef1234
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "659f1234567890abcdef1234",
      "vendorId": {
        "_id": "68982d7316eb32315a363a86",
        "companyName": "Tech Solutions Inc",
        "email": "vendor@example.com",
        "phone": "+1234567890",
        "address": {
          "street": "456 Business Ave",
          "city": "San Francisco",
          "state": "CA",
          "zipCode": "94105",
          "country": "USA"
        }
      },
      "productId": {
        "_id": "68982d7316eb32315a363a87",
        "title": "Gaming Laptop Pro",
        "price": 1299.99,
        "images": [...],
        "description": "High-performance gaming laptop"
      },
      "quantity": 2,
      "email": "customer@example.com",
      "number": "+1234567890",
      "name": "John Doe",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "deliveredFlag": false,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "orderTime": "10:30:00"
    },
    "orderDetails": {
      "orderId": "659f1234567890abcdef1234",
      "customerName": "John Doe",
      "productName": "Gaming Laptop Pro",
      "vendorName": "Tech Solutions Inc",
      "quantity": 2,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "orderTime": "10:30:00",
      "status": "Pending",
      "fullAddress": "123 Main Street, New York, NY 10001, USA"
    }
  }
}
```

### 3. Check Order Status
```http
GET /api/customer/status/:id/:email
```

**Access:** Public (Customer order tracking)

**Parameters:**
- `id` (String): Order ID
- `email` (String): Customer email (for verification)

**Example:**
```
GET /api/customer/status/659f1234567890abcdef1234/customer@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "659f1234567890abcdef1234",
    "status": "Pending",
    "orderDate": "2024-01-15T10:30:00.000Z",
    "orderTime": "10:30:00",
    "customerName": "John Doe",
    "product": {
      "_id": "68982d7316eb32315a363a87",
      "title": "Gaming Laptop Pro",
      "price": 1299.99,
      "images": [...]
    },
    "vendor": {
      "_id": "68982d7316eb32315a363a86",
      "companyName": "Tech Solutions Inc",
      "phone": "+1234567890"
    },
    "quantity": 2,
    "deliveryAddress": "123 Main Street, New York, NY 10001, USA"
  }
}
```

---

## 🔒 PROTECTED ROUTES (Authentication Required)

### Authentication Methods

**Option 1: Cookie Authentication (Recommended)**
```javascript
// Automatic - token stored in httpOnly cookie after login
fetch('/api/customer/admin/all', {
  credentials: 'include'
})
```

**Option 2: Bearer Token**
```javascript
fetch('/api/customer/admin/all', {
  headers: {
    'Authorization': 'Bearer your_jwt_token_here',
    'Content-Type': 'application/json'
  }
})
```

### 1. Get All Customers
```http
GET /api/customer/admin/all
```

**Access:** Private (Admin: all customers, Vendor: own customers only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 20 | Items per page (max 100) |
| `vendorId` | String | - | Filter by vendor ID (admin only) |
| `productId` | String | - | Filter by product ID |
| `deliveredFlag` | Boolean | - | Filter by delivery status |
| `search` | String | - | Search in name, email, number, city, state |
| `sortBy` | String | orderDate | Sort field |
| `sortOrder` | String | desc | Sort order (asc/desc) |
| `startDate` | String | - | Filter from date (YYYY-MM-DD) |
| `endDate` | String | - | Filter to date (YYYY-MM-DD) |

**Example:**
```
GET /api/customer/admin/all?page=1&limit=10&deliveredFlag=false&search=john&sortBy=orderDate&sortOrder=desc&startDate=2024-01-01&endDate=2024-01-31
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "659f1234567890abcdef1234",
      "name": "John Doe",
      "email": "customer@example.com",
      "number": "+1234567890",
      "quantity": 2,
      "deliveredFlag": false,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "orderTime": "10:30:00",
      "productId": {
        "_id": "68982d7316eb32315a363a87",
        "title": "Gaming Laptop Pro",
        "price": 1299.99,
        "images": [...]
      },
      "vendorId": {
        "_id": "68982d7316eb32315a363a86",
        "companyName": "Tech Solutions Inc",
        "email": "vendor@example.com",
        "phone": "+1234567890"
      },
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 95,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalOrders": 95,
    "deliveredOrders": 67,
    "pendingOrders": 28,
    "totalQuantity": 150
  }
}
```

### 2. Update Customer Order
```http
PUT /api/customer/admin/:id
```

**Access:** Private (Admin: any order, Vendor: own customers only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Parameters:**
- `id` (String): Customer order ID

**Request Body:**
```json
{
  "quantity": 3,
  "email": "newemail@example.com",
  "number": "+1987654321",
  "name": "John Smith",
  "address": {
    "street": "456 New Street",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "deliveredFlag": true
}
```

**Allowed Update Fields:**
- `quantity` (Number): New quantity
- `email` (String): Customer email
- `number` (String): Customer phone
- `name` (String): Customer name
- `address` (Object): Complete or partial address
- `deliveredFlag` (Boolean): Delivery status

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "659f1234567890abcdef1234",
    "name": "John Smith",
    "email": "newemail@example.com",
    "number": "+1987654321",
    "quantity": 3,
    "deliveredFlag": true,
    "address": {
      "street": "456 New Street",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02101",
      "country": "USA"
    },
    "productId": {
      "_id": "68982d7316eb32315a363a87",
      "title": "Gaming Laptop Pro",
      "price": 1299.99
    },
    "vendorId": {
      "_id": "68982d7316eb32315a363a86",
      "companyName": "Tech Solutions Inc"
    },
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

### 3. Delete Customer Order
```http
DELETE /api/customer/admin/:id
```

**Access:** Private (Admin: any order, Vendor: own customers only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Parameters:**
- `id` (String): Customer order ID

**Example:**
```
DELETE /api/customer/admin/659f1234567890abcdef1234
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": {
    "deletedOrder": {
      "id": "659f1234567890abcdef1234",
      "customerName": "John Doe",
      "email": "customer@example.com",
      "orderDate": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Mark Order as Delivered
```http
PATCH /api/customer/admin/:id/deliver
```

**Access:** Private (Admin: any order, Vendor: own customers only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Parameters:**
- `id` (String): Customer order ID

**Example:**
```
PATCH /api/customer/admin/659f1234567890abcdef1234/deliver
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": {
    "orderId": "659f1234567890abcdef1234",
    "customerName": "John Doe",
    "deliveredFlag": true,
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

### 5. Bulk Mark as Delivered
```http
PATCH /api/customer/admin/bulk-deliver
```

**Access:** Private (Admin: any orders, Vendor: own customers only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerIds": [
    "659f1234567890abcdef1234",
    "659f1234567890abcdef1235",
    "659f1234567890abcdef1236"
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 orders marked as delivered successfully",
  "data": {
    "matched": 3,
    "modified": 3
  }
}
```

### 6. Get Customer Analytics
```http
GET /api/customer/admin/analytics
```

**Access:** Private (Admin: all data, Vendor: own data only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | Number | 30 | Analytics period in days |
| `vendorId` | String | - | Filter by vendor (admin only) |

**Example:**
```
GET /api/customer/admin/analytics?days=7&vendorId=68982d7316eb32315a363a86
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "deliveredOrders": 120,
      "pendingOrders": 30,
      "totalQuantity": 300,
      "uniqueCustomers": 85,
      "deliveryRate": 80.0
    },
    "dailyOrders": [
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "day": 15
        },
        "orders": 12,
        "delivered": 8
      },
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "day": 16
        },
        "orders": 8,
        "delivered": 5
      }
    ],
    "topProducts": [
      {
        "_id": "68982d7316eb32315a363a87",
        "productName": "Gaming Laptop Pro",
        "orderCount": 25,
        "totalQuantity": 30
      },
      {
        "_id": "68982d7316eb32315a363a88",
        "productName": "Wireless Headphones",
        "orderCount": 18,
        "totalQuantity": 22
      }
    ],
    "topCities": [
      {
        "_id": "New York",
        "orderCount": 45
      },
      {
        "_id": "Los Angeles",
        "orderCount": 32
      }
    ],
    "period": "Last 7 days"
  }
}
```

---

## 🛍️ VENDOR-SPECIFIC ROUTES

### 1. Get Vendor's Customers Only
```http
GET /api/customer/vendor/my-customers
```

**Access:** Private (Vendor Only)

**Headers:**
```
Authorization: Bearer vendor_jwt_token
```

**Query Parameters:** Same as `/admin/all` but automatically filtered to vendor's customers

**Example:**
```
GET /api/customer/vendor/my-customers?page=1&limit=10&deliveredFlag=false
```

### 2. Get Vendor's Analytics
```http
GET /api/customer/vendor/my-analytics
```

**Access:** Private (Vendor Only)

**Headers:**
```
Authorization: Bearer vendor_jwt_token
```

**Query Parameters:**
- `days` (Number): Analytics period (default: 30)

**Example:**
```
GET /api/customer/vendor/my-analytics?days=14
```

---

## 🧪 Testing Examples

### Frontend JavaScript Examples

#### 1. Create Order (Public)
```javascript
const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vendorId: "68982d7316eb32315a363a86",
        productId: "68982d7316eb32315a363a87",
        quantity: 2,
        email: "customer@example.com",
        number: "+1234567890",
        name: "John Doe",
        address: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001"
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Order created:', result.data.orderDetails);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
```

#### 2. Check Order Status (Public)
```javascript
const checkOrderStatus = async (orderId, email) => {
  try {
    const response = await fetch(`/api/customer/status/${orderId}/${email}`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};
```

#### 3. Get Vendor's Customers (Protected)
```javascript
const getMyCustomers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/customer/vendor/my-customers?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw error;
  }
};
```

#### 4. Mark Order as Delivered (Protected)
```javascript
const markAsDelivered = async (orderId) => {
  try {
    const response = await fetch(`/api/customer/admin/${orderId}/deliver`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      console.log('Order marked as delivered:', result.data);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to mark as delivered:', error);
    throw error;
  }
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useCustomers = (userRole) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const fetchCustomers = async (filters = {}) => {
    setLoading(true);
    try {
      const endpoint = userRole === 'vendor'
        ? '/api/customer/vendor/my-customers'
        : '/api/customer/admin/all';

      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${endpoint}?${queryParams}`, {
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        setCustomers(result.data);
        return result;
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (orderId) => {
    try {
      const response = await fetch(`/api/customer/admin/${orderId}/deliver`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setCustomers(prev =>
          prev.map(customer =>
            customer._id === orderId
              ? { ...customer, deliveredFlag: true }
              : customer
          )
        );
        return result;
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
    }
  };

  const fetchAnalytics = async (days = 30) => {
    try {
      const endpoint = userRole === 'vendor'
        ? '/api/customer/vendor/my-analytics'
        : '/api/customer/admin/analytics';

      const response = await fetch(`${endpoint}?days=${days}`, {
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return {
    customers,
    analytics,
    loading,
    fetchCustomers,
    markDelivered,
    fetchAnalytics
  };
};

export default useCustomers;
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes:
- **200**: Success
- **201**: Created (new order)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (no token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (order/vendor/product not found)
- **429**: Too Many Requests (rate limited)
- **500**: Server Error

### Error Response Format:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

## 🔐 Access Control Summary

| Endpoint | Public | Vendor | Admin | Notes |
|----------|--------|--------|-------|-------|
| `POST /api/customer` | ✅ | ✅ | ✅ | Anyone can place orders |
| `GET /api/customer/:id` | ✅ | ✅ | ✅ | Anyone can view orders |
| `GET /api/customer/status/:id/:email` | ✅ | ✅ | ✅ | Order tracking |
| `GET /api/customer/admin/all` | ❌ | ✅* | ✅ | *Own customers only |
| `PUT /api/customer/admin/:id` | ❌ | ✅* | ✅ | *Own customers only |
| `DELETE /api/customer/admin/:id` | ❌ | ✅* | ✅ | *Own customers only |
| `PATCH /api/customer/admin/:id/deliver` | ❌ | ✅* | ✅ | *Own customers only |
| `GET /api/customer/admin/analytics` | ❌ | ✅* | ✅ | *Own data only |
| `PATCH /api/customer/admin/bulk-deliver` | ❌ | ✅* | ✅ | *Own customers only |
| `GET /api/customer/vendor/my-customers` | ❌ | ✅ | ❌ | Vendor only |
| `GET /api/customer/vendor/my-analytics` | ❌ | ✅ | ❌ | Vendor only |

------------------------------Banners---------------------------
# 🎯 Banner API Documentation

## 📋 **Complete Route List**

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/banners` | Public | Get all visible banners |
| GET | `/api/banners/admin/stats` | Admin Only | Get banner statistics |
| GET | `/api/banners/admin/all` | Admin Only | Get all banners (with filters) |
| POST | `/api/banners/admin` | Admin Only | Create new banner |
| GET | `/api/banners/admin/:id` | Admin Only | Get single banner |
| PUT | `/api/banners/admin/:id` | Admin Only | Update banner |
| DELETE | `/api/banners/admin/:id` | Admin Only | Delete banner |
| PATCH | `/api/banners/admin/:id/toggle` | Admin Only | Toggle banner visibility |

---

## 🌐 **PUBLIC ROUTES**

### 1. Get All Visible Banners
```
GET /api/banners
```
**Access:** Public (No authentication required)
**Description:** Returns all visible, non-expired banners for frontend display

**Request:**
- No body required
- No headers required

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "banners": [
      {
        "_id": "66b7a1234567890abcdef123",
        "title": "Summer Sale Banner",
        "imageUrl": "https://res.cloudinary.com/image.jpg",
        "vendorId": {
          "_id": "66b7a1234567890abcdef456",
          "companyName": "Tech Store"
        },
        "createdAt": "2025-08-10T10:30:00.000Z",
        "expiryDate": "2025-08-25T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🔐 **ADMIN ONLY ROUTES**
*Requires: Admin login with cookie-based authentication*

### 2. Get Banner Statistics
```
GET /api/banners/admin/stats
```

**Request:**
- **Headers:** Cookie with admin token (automatic after login)
- **Body:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalBanners": 25,
      "visibleBanners": 18,
      "expiredBanners": 7,
      "soonToExpire": 3
    }
  }
}
```

### 3. Get All Banners (Admin View)
```
GET /api/banners/admin/all
```

**Request:**
- **Headers:** Cookie with admin token
- **Query Parameters (all optional):**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `isVisible`: Filter by visibility (true/false)
  - `vendorId`: Filter by vendor ID

**Examples:**
```
GET /api/banners/admin/all
GET /api/banners/admin/all?page=2&limit=5
GET /api/banners/admin/all?isVisible=true
GET /api/banners/admin/all?vendorId=66b7a1234567890abcdef456
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalBanners": 15
  },
  "data": {
    "banners": [
      {
        "_id": "66b7a1234567890abcdef123",
        "title": "Summer Sale Banner",
        "imageUrl": "https://res.cloudinary.com/image.jpg",
        "publicId": "marketplace/banners/banner_123",
        "vendorId": {
          "_id": "66b7a1234567890abcdef456",
          "companyName": "Tech Store",
          "email": "tech@store.com",
          "phone": "+1234567890"
        },
        "visibilityDays": 15,
        "expiryDate": "2025-08-25T10:30:00.000Z",
        "isVisible": true,
        "createdBy": {
          "_id": "66b7a1234567890abcdef789",
          "username": "admin",
          "email": "admin@marketplace.com"
        },
        "createdAt": "2025-08-10T10:30:00.000Z",
        "updatedAt": "2025-08-10T10:30:00.000Z"
      }
    ]
  }
}
```

### 4. Create New Banner
```
POST /api/banners/admin
```

**Request:**
- **Headers:** Cookie with admin token
- **Content-Type:** `multipart/form-data`
- **Form Data (all required):**
  - `title`: Banner title (string, max 100 characters)
  - `vendorId`: MongoDB ObjectId of vendor (string)
  - `visibilityDays`: Number of days (number, must be: 7, 10, 12, 15, 17, or 30)
  - `image`: Image file (file, max 5MB, images only)

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/banners/admin \
  -H "Cookie: token=your_admin_token" \
  -F "title=Summer Sale Banner" \
  -F "vendorId=66b7a1234567890abcdef456" \
  -F "visibilityDays=15" \
  -F "image=@/path/to/banner.jpg"
```

**Example using Postman:**
- Method: POST
- URL: `http://localhost:5000/api/banners/admin`
- Headers: (Cookie will be set automatically after admin login)
- Body: form-data
  - title: "Summer Sale Banner"
  - vendorId: "66b7a1234567890abcdef456"
  - visibilityDays: 15
  - image: [Select file]

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "banner": {
      "_id": "66b7a1234567890abcdef123",
      "title": "Summer Sale Banner",
      "vendorId": {
        "_id": "66b7a1234567890abcdef456",
        "companyName": "Tech Store",
        "email": "tech@store.com"
      },
      "imageUrl": "https://res.cloudinary.com/image.jpg",
      "publicId": "marketplace/banners/banner_123",
      "visibilityDays": 15,
      "expiryDate": "2025-08-25T10:30:00.000Z",
      "isVisible": true,
      "createdAt": "2025-08-10T10:30:00.000Z"
    }
  }
}
```

### 5. Get Single Banner
```
GET /api/banners/admin/:id
```

**Request:**
- **Headers:** Cookie with admin token
- **URL Parameter:**
  - `id`: Banner MongoDB ObjectId

**Example:**
```
GET /api/banners/admin/66b7a1234567890abcdef123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "banner": {
      "_id": "66b7a1234567890abcdef123",
      "title": "Summer Sale Banner",
      "vendorId": {
        "_id": "66b7a1234567890abcdef456",
        "companyName": "Tech Store",
        "email": "tech@store.com",
        "phone": "+1234567890"
      },
      "imageUrl": "https://res.cloudinary.com/image.jpg",
      "publicId": "marketplace/banners/banner_123",
      "visibilityDays": 15,
      "expiryDate": "2025-08-25T10:30:00.000Z",
      "isVisible": true,
      "createdBy": {
        "_id": "66b7a1234567890abcdef789",
        "username": "admin",
        "email": "admin@marketplace.com"
      },
      "createdAt": "2025-08-10T10:30:00.000Z",
      "updatedAt": "2025-08-10T10:30:00.000Z"
    }
  }
}
```

### 6. Update Banner
```
PUT /api/banners/admin/:id
```

**Request:**
- **Headers:** Cookie with admin token
- **URL Parameter:**
  - `id`: Banner MongoDB ObjectId
- **Content-Type:** `multipart/form-data`
- **Form Data (all optional):**
  - `title`: New banner title (string, max 100 characters)
  - `vendorId`: New vendor ID (string, MongoDB ObjectId)
  - `visibilityDays`: New visibility duration (number: 7, 10, 12, 15, 17, or 30)
  - `isVisible`: Manual visibility toggle (boolean: true/false)
  - `image`: New image file (file, max 5MB, will replace existing)

**Example using curl:**
```bash
curl -X PUT http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123 \
  -H "Cookie: token=your_admin_token" \
  -F "title=Updated Banner Title" \
  -F "visibilityDays=30"
```

**Example using Postman:**
- Method: PUT
- URL: `http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123`
- Headers: (Cookie will be set automatically after admin login)
- Body: form-data
  - title: "Updated Banner Title"
  - visibilityDays: 30

**Response:**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "banner": {
      "_id": "66b7a1234567890abcdef123",
      "title": "Updated Banner Title",
      "visibilityDays": 30,
      "expiryDate": "2025-09-09T10:30:00.000Z"
    }
  }
}
```

### 7. Toggle Banner Visibility
```
PATCH /api/banners/admin/:id/toggle
```

**Request:**
- **Headers:** Cookie with admin token
- **URL Parameter:**
  - `id`: Banner MongoDB ObjectId
- **Body:** None

**Example using curl:**
```bash
curl -X PATCH http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123/toggle \
  -H "Cookie: token=your_admin_token"
```

**Example using Postman:**
- Method: PATCH
- URL: `http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123/toggle`
- Headers: (Cookie will be set automatically after admin login)
- Body: None

**Response:**
```json
{
  "success": true,
  "message": "Banner enabled successfully",
  "data": {
    "banner": {
      "id": "66b7a1234567890abcdef123",
      "title": "Summer Sale Banner",
      "isVisible": true
    }
  }
}
```

### 8. Delete Banner
```
DELETE /api/banners/admin/:id
```

**Request:**
- **Headers:** Cookie with admin token
- **URL Parameter:**
  - `id`: Banner MongoDB ObjectId

**Example using curl:**
```bash
curl -X DELETE http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123 \
  -H "Cookie: token=your_admin_token"
```

**Example using Postman:**
- Method: DELETE
- URL: `http://localhost:5000/api/banners/admin/66b7a1234567890abcdef123`
- Headers: (Cookie will be set automatically after admin login)
- Body: None

**Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## 🔥 **Error Responses**

### Authentication Error:
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Error:
```json
{
  "success": false,
  "message": "Access denied. Super Admin access required."
}
```

### Validation Error:
```json
{
  "success": false,
  "message": "Title, vendor ID and visibility days are required"
}
```

### Not Found Error:
```json
{
  "success": false,
  "message": "Banner not found"
}
```

### File Upload Error:
```json
{
  "success": false,
  "message": "Banner image is required"
}
```

### Vendor Not Found:
```json
{
  "success": false,
  "message": "Vendor not found"
}
```

---

## 📝 **Important Notes**

1. **Authentication:** All admin routes require login. After admin login at `/api/auth/admin/login`, the token is stored in cookies automatically.

2. **File Upload:** Use `multipart/form-data` for routes with image upload (CREATE and UPDATE). Maximum file size is 5MB. Only image files are allowed.

3. **Visibility Days:** Only these values are allowed: 7, 10, 12, 15, 17, 30. Any other value will cause a validation error.

4. **Auto-Expiry:** Banners automatically become invisible after their expiry date. The system runs an hourly check to update expired banners.

5. **Image Management:** Images are uploaded to Cloudinary. When banners are deleted or images are replaced, old images are automatically deleted from Cloudinary.

6. **Vendor Validation:** The system checks if the provided vendorId exists before creating/updating banners.

7. **ObjectId Format:** All IDs must be valid MongoDB ObjectIds (24 character hex string).

## 🧪 **Testing Order**

1. **Login as admin first:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}' \
     -c cookies.txt
   ```

2. **Test public route:**
   ```bash
   curl http://localhost:5000/api/banners
   ```

3. **Test admin routes (use cookies from login):**
   ```bash
   # Get stats
   curl -b cookies.txt http://localhost:5000/api/banners/admin/stats

   # Get all banners
   curl -b cookies.txt http://localhost:5000/api/banners/admin/all

   # Create banner
   curl -X POST -b cookies.txt http://localhost:5000/api/banners/admin \
     -F "title=Test Banner" \
     -F "vendorId=YOUR_VENDOR_ID" \
     -F "visibilityDays=15" \
     -F "image=@path/to/image.jpg"
   ```

## 🎯 **Quick Reference**

- **Base URL:** `http://localhost:5000/api/banners`
- **Admin Login:** `POST /api/auth/admin/login`
- **Public Route:** `GET /api/banners`
- **Admin Routes:** All under `/api/banners/admin/*`
- **Authentication:** Cookie-based (automatic after login)
- **File Upload:** `multipart/form-data` for CREATE/UPDATE with images
