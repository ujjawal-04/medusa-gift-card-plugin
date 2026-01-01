import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { validateGiftCardStep } from "./steps/validate-gift-card";
import { applyGiftCardToCartStep } from "./steps/apply-gfit-card-to-cart";

type ApplyGiftCardInput = {
  cart_id: string;
  gift_card_code: string;
  cart_total: number;
};

export const applyGiftCardWorkflow = createWorkflow(
  "apply-gift-card",
  (input: ApplyGiftCardInput) => {
    // Validate the gift card
    const { gift_card } = validateGiftCardStep({
      code: input.gift_card_code,
    });

    // Apply to cart
    const application = applyGiftCardToCartStep({
      cart_id: input.cart_id,
      gift_card_code: input.gift_card_code,
      gift_card_id: gift_card.id,
      cart_total: input.cart_total,
    });

    return new WorkflowResponse({
      gift_card,
      application,
    });
  }
);