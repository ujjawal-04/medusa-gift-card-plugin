import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createGiftCardStep } from "./steps/create-gift-card";
import { sendGiftCardEmailStep } from "./steps/send-gift-card-email";

type PurchaseGiftCardInput = {
  initial_value: number;
  currency_code: string;
  recipient_email: string;
  recipient_name?: string;
  message?: string;
  purchaser_id?: string;
  purchaser_email?: string;
  order_id?: string;
  expires_in_days?: number;
};

export const purchaseGiftCardWorkflow = createWorkflow(
  "purchase-gift-card",
  (input: PurchaseGiftCardInput) => {
    // Create the gift card
    const giftCard = createGiftCardStep({
      initial_value: input.initial_value,
      currency_code: input.currency_code,
      recipient_email: input.recipient_email,
      recipient_name: input.recipient_name,
      message: input.message,
      purchaser_id: input.purchaser_id,
      purchaser_email: input.purchaser_email,
      order_id: input.order_id,
      expires_in_days: input.expires_in_days,
    });

    // Send email to recipient
    const emailResult = sendGiftCardEmailStep({
      gift_card_id: giftCard.id,
      gift_card_code: giftCard.code,
      recipient_email: input.recipient_email,
      recipient_name: input.recipient_name,
      initial_value: input.initial_value,
      currency_code: input.currency_code,
      message: input.message,
      purchaser_email: input.purchaser_email,
    });

    return new WorkflowResponse({
      gift_card: giftCard,
      email_sent: emailResult,
    });
  }
);