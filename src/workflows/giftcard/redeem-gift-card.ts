import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { validateGiftCardStep } from "./steps/validate-gift-card";
import { redeemGiftCardStep } from "./steps/redeem-gift-card";

type RedeemGiftCardInput = {
  gift_card_code: string;
  amount: number;
  order_id: string;
  cart_id?: string;
  customer_id?: string;
};

export const redeemGiftCardWorkflow = createWorkflow(
  "redeem-gift-card",
  (input: RedeemGiftCardInput) => {
    // Validate the gift card
    const { gift_card } = validateGiftCardStep({
      code: input.gift_card_code,
      required_amount: input.amount,
    });

    // Redeem the gift card
    const redemption = redeemGiftCardStep({
      gift_card_id: gift_card.id,
      gift_card_code: input.gift_card_code,
      amount: input.amount,
      order_id: input.order_id,
      cart_id: input.cart_id,
      customer_id: input.customer_id,
    });

    return new WorkflowResponse({
      gift_card,
      redemption,
    });
  }
);