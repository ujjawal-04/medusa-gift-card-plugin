import { model } from "@medusajs/framework/utils";

/**
 * GiftCard represents a purchased gift card with a unique code
 */
const GiftCard = model.define("gift_card", {
  id: model.id().primaryKey(),
  
  // Gift card code
  code: model.text().unique(), // Unique code for redemption
  
  // Value
  initial_value: model.bigNumber(), // Original value
  balance: model.bigNumber(), // Current balance
  currency_code: model.text(), // Currency (e.g., "usd")
  
  // Purchase details
  purchaser_id: model.text().nullable(), // Customer who purchased
  purchaser_email: model.text().nullable(), // Purchaser email
  order_id: model.text().nullable(), // Order ID from purchase
  
  // Recipient details
  recipient_email: model.text(), // Who receives the gift card
  recipient_name: model.text().nullable(), // Recipient name
  message: model.text().nullable(), // Personal message
  
  // Status and usage
  status: model.enum(["active", "used", "expired", "cancelled"]).default("active"),
  used_count: model.number().default(0), // Number of times used
  
  // Dates
  purchased_at: model.dateTime().nullable(),
  sent_at: model.dateTime().nullable(), // When email was sent
  first_used_at: model.dateTime().nullable(),
  expires_at: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
});

export default GiftCard;