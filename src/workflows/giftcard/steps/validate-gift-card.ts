import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";

type ValidateGiftCardInput = {
  code: string;
  required_amount?: number;
};

export const validateGiftCardStep = createStep(
  "validate-gift-card",
  async (input: ValidateGiftCardInput, { container }) => {
    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Find gift card by code
    const giftCards = await giftCardService.listGiftCards({
      code: input.code,
    });

    if (giftCards.length === 0) {
      throw new Error(`Gift card with code ${input.code} not found`);
    }

    const giftCard = giftCards[0];

    // Check status
    if (giftCard.status !== "active") {
      throw new Error(`Gift card is ${giftCard.status} and cannot be used`);
    }

    // Check expiry
    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      throw new Error("Gift card has expired");
    }    // Check balance
    if (Number(giftCard.balance) <= 0) {
      throw new Error("Gift card has no remaining balance");
    }

    // Check if sufficient balance (if required amount specified)
    if (input.required_amount && Number(giftCard.balance) < input.required_amount) {
      throw new Error(
        `Insufficient balance. Available: ${giftCard.balance}, Required: ${input.required_amount}`
      );
    }

    return new StepResponse({ valid: true, gift_card: giftCard });
  }
);