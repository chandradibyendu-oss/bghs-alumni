# Admin Payment Configuration Guide

## 🎯 Overview

The Admin Payment Configuration page allows administrators to manage payment amounts, categories, and settings globally.

---

## 🔑 **Access Requirements**

**Who can access:**
- ✅ Super Admin
- ✅ Admin
- ❌ Regular users (will be redirected)

**URL:** http://localhost:3000/admin/payments

**Access via Dashboard:**
1. Login as admin
2. Go to Dashboard
3. Click **"Payment Settings"** card (visible only for admins)

---

## ✨ **Features**

### **1. View All Payment Configurations**

The page shows all configured payment categories with:
- ✅ Configuration name
- ✅ Category badge (Registration, Event, Donation, etc.)
- ✅ Amount (₹)
- ✅ Active/Inactive status toggle
- ✅ Mandatory badge (if required)
- ✅ Payment gateway
- ✅ Edit and Delete actions

### **2. Create New Payment Configuration**

Click **"Add Configuration"** button to create:

**Fields:**
- **Category** (dropdown):
  - Registration Fee
  - Event Fee
  - Donation
  - Membership Renewal
  - Other

- **Configuration Name** (text):
  - e.g., "New Member Registration Fee"
  - e.g., "Annual Membership Renewal"
  - e.g., "Event Registration - Annual Reunion"

- **Description** (textarea):
  - Brief description of the payment
  - Optional

- **Amount** (number):
  - Payment amount in rupees
  - e.g., 500.00

- **Currency** (dropdown):
  - INR (₹) - Indian Rupee
  - USD ($) - US Dollar
  - EUR (€) - Euro

- **Payment Gateway** (dropdown):
  - RazorPay (default)
  - Manual/Offline

- **Active** (checkbox):
  - Enable/disable this configuration
  - Only active configurations are used

- **Mandatory** (checkbox):
  - If checked, payment cannot be skipped
  - User must complete payment

### **3. Edit Existing Configuration**

Click **Edit icon** (pencil) on any configuration to:
- Update amount
- Change description
- Toggle active/inactive
- Toggle mandatory status
- Modify settings

### **4. Delete Configuration**

Click **Delete icon** (trash) to remove a configuration:
- Confirmation dialog shown
- Cannot be undone
- Existing transactions remain in database

### **5. Toggle Active/Inactive**

Click the **toggle switch** to quickly enable/disable a configuration:
- Green toggle = Active
- Gray toggle = Inactive
- Instant update without modal

---

## 💡 **Usage Examples**

### **Example 1: Registration Fee**

```
Category: Registration Fee
Name: New Member Registration
Description: One-time registration fee for new alumni members
Amount: 500.00
Currency: INR
Active: ✅ Yes
Mandatory: ✅ Yes
Gateway: RazorPay
```

**Use case:** New users must pay ₹500 after admin approves registration

---

### **Example 2: Event Registration**

```
Category: Event Fee
Name: Annual Reunion 2024
Description: Registration fee for Annual Reunion event
Amount: 1500.00
Currency: INR
Active: ✅ Yes
Mandatory: ⬜ No
Gateway: RazorPay
```

**Use case:** Users pay ₹1500 when registering for Annual Reunion event

---

### **Example 3: Membership Renewal**

```
Category: Membership Renewal
Name: Annual Membership 2024-25
Description: Annual membership renewal fee
Amount: 300.00
Currency: INR
Active: ✅ Yes
Mandatory: ⬜ No
Gateway: RazorPay
```

**Use case:** Annual membership renewal payment

---

### **Example 4: Donation**

```
Category: Donation
Name: General Donation
Description: Support BGHS Alumni Association
Amount: 0.00
Currency: INR
Active: ✅ Yes
Mandatory: ⬜ No
Gateway: RazorPay
```

**Use case:** Users can donate any amount (amount is 0 = user decides)

---

## 📋 **How to Use**

### **Step 1: Create Payment Configurations**

1. Login as admin
2. Go to: http://localhost:3000/admin/payments
3. Click **"Add Configuration"**
4. Fill in details:
   - Select category
   - Enter name and description
   - Set amount
   - Check "Active" and "Mandatory" as needed
5. Click **"Create Configuration"**

### **Step 2: Manage Configurations**

**To Edit:**
- Click pencil icon
- Update fields
- Click "Update Configuration"

**To Delete:**
- Click trash icon
- Confirm deletion

**To Toggle Active:**
- Click toggle switch
- Instant enable/disable

### **Step 3: Use in Application**

Once configurations are created, you can:

**For Events:**
- In event creation, link to payment config
- Users pay the configured amount when registering

**For Registration:**
- After admin approval, send payment link
- User pays configured registration fee

**For Donations:**
- Use donation configuration
- Users pay configured or custom amount

---

## 🔐 **Security & Permissions**

### **Access Control:**
- ✅ Only super_admin and admin roles can access
- ✅ Regular users redirected to dashboard
- ✅ Authentication required
- ✅ Database RLS policies enforce access

### **Data Security:**
- ✅ All operations logged
- ✅ Changes tracked with timestamps
- ✅ Created_by field tracks who created config
- ✅ Cannot modify transactions, only configurations

---

## 📊 **Database Integration**

### **Table: payment_configurations**

When you create a configuration, it's saved to:
```sql
INSERT INTO payment_configurations (
  category,
  name,
  description,
  amount,
  currency,
  is_active,
  is_mandatory,
  payment_gateway,
  created_by
) VALUES (...);
```

### **Usage in Code:**

```tsx
// Fetch active configurations
const { data } = await supabase
  .from('payment_configurations')
  .select('*')
  .eq('category', 'event_fee')
  .eq('is_active', true)
  .single();

// Use the amount
const amount = data.amount; // e.g., 500.00
```

---

## 🎯 **Best Practices**

### **Configuration Naming:**
- ✅ Use descriptive names: "Annual Reunion Registration 2024"
- ❌ Avoid vague names: "Event Payment"

### **Amounts:**
- ✅ Set realistic amounts
- ✅ Use 0.00 for variable amounts (donations)
- ✅ Include decimal places: 500.00

### **Active/Inactive:**
- ✅ Disable old configurations instead of deleting
- ✅ Create new configurations for new years
- ✅ Keep history of past configurations

### **Mandatory Flag:**
- ✅ Set mandatory for required payments (registration)
- ⬜ Leave unchecked for optional payments (donations)

---

## 🚀 **Quick Start**

### **Create Your First Configuration:**

1. **Login as admin**
2. **Go to:** http://localhost:3000/admin/payments
3. **Click:** "Add Configuration"
4. **Fill in:**
   ```
   Category: Registration Fee
   Name: New Member Registration
   Description: One-time registration fee
   Amount: 500.00
   Currency: INR
   Active: ✅
   Mandatory: ✅
   ```
5. **Click:** "Create Configuration"
6. **Done!** Configuration is ready to use

---

## 📱 **Screenshots Reference**

### **Main Page View:**
```
┌────────────────────────────────────────────┐
│ ← Back to Dashboard                        │
│ 💳 Payment Configuration                   │
│                         [+ Add Config]     │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────┐    │
│ │ New Member Registration            │    │
│ │ [Registration Fee] [Mandatory]     │    │
│ │ [Toggle: Active]                   │    │
│ │                                    │    │
│ │ One-time registration fee          │    │
│ │ 💰 ₹500.00 INR                     │    │
│ │ Gateway: razorpay                  │    │
│ │                      [✏️ Edit] [🗑️ Delete] │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

### **Create/Edit Form:**
```
┌────────────────────────────────────────────┐
│ New Payment Configuration           [X]    │
├────────────────────────────────────────────┤
│ Category *                                 │
│ [Registration Fee ▼]                       │
│                                            │
│ Configuration Name *                       │
│ [New Member Registration           ]       │
│                                            │
│ Description                                │
│ [One-time registration fee...      ]       │
│                                            │
│ Amount *              Currency             │
│ [500.00      ]        [INR ▼]             │
│                                            │
│ Payment Gateway                            │
│ [RazorPay ▼]                               │
│                                            │
│ ☑ Active - Enable this configuration      │
│ ☑ Mandatory - Payment is required         │
│                                            │
│ [Cancel]          [💾 Create Configuration]│
└────────────────────────────────────────────┘
```

---

## ✅ **Testing Checklist**

- [ ] Login as admin
- [ ] Navigate to /admin/payments
- [ ] Create a test configuration
- [ ] Edit the configuration
- [ ] Toggle active/inactive
- [ ] Delete test configuration
- [ ] Verify changes in database
- [ ] Check configurations appear in Supabase

---

## 📞 **Next Steps**

After creating configurations:

1. **Link to Events:** Connect event fees to specific events
2. **Link to Registration:** Use for new user registration
3. **Link to Donations:** Configure donation categories
4. **Send Payment Links:** Use in user approval emails

---

**Your admin payment configuration page is ready!** 🎉

Access at: http://localhost:3000/admin/payments

---

**Last Updated:** Step 6 Complete  
**Status:** ✅ Fully Functional
