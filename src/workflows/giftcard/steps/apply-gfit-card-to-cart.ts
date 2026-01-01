import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";

type ApplyGiftCardToCartInput = {
  cart_id: string;
  gift_card_code: string;
  gift_card_id: string;
  cart_total: number;
};

export const applyGiftCardToCartStep = createStep(
  "apply-gift-card-to-cart",
  async (input: ApplyGiftCardToCartInput, { container }) => {
    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Get gift card
    const giftCard = await giftCardService.retrieveGiftCard(input.gift_card_id);
    
    const balance = Number(giftCard.balance);
    
    // Calculate discount amount (minimum of balance and cart total)
    const discountAmount = Math.min(balance, input.cart_total);

    // Store gift card application in cart metadata
    // This will be used during checkout to actually deduct from gift card
    return new StepResponse({
      gift_card_id: input.gift_card_id,
      gift_card_code: input.gift_card_code,
      discount_amount: discountAmount,
      applied: true,
    });
  }
);