import { model } from "@medusajs/framework/utils";

/**
 * GiftCardTransaction tracks all uses of a gift card
 */
const GiftCardTransaction = model.define("gift_card_transaction", {
  id: model.id().primaryKey(),
  
  // Gift card reference
  gift_card_id: model.text(),
  gift_card_code: model.text(), // For quick reference
  
  // Transaction type
  type: model.enum([
    "purchase", // Initial purchase
    "redemption", // Used for order
    "refund", // Refunded back to card
    "cancellation" // Card cancelled
  ]),
  
  // Amount
  amount: model.bigNumber(), // Amount used/added
  balance_after: model.bigNumber(), // Balance after transaction
  currency_code: model.text(),
  
  // Related entities
  order_id: model.text().nullable(), // Associated order
  cart_id: model.text().nullable(), // Associated cart
  customer_id: model.text().nullable(), // Customer who used it
  
  // Metadata
  metadata: model.json().nullable(),
});

export default GiftCardTransaction;