import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";
import { generateGiftCardCode } from "../../../modules/giftcard/utils/code-generator";

type CreateGiftCardInput = {
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

export const createGiftCardStep = createStep(
  "create-gift-card",
  async (input: CreateGiftCardInput, { container }) => {
    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Generate unique code
    let code = generateGiftCardCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await giftCardService.listGiftCards({ code });
      if (existing.length === 0) {
        break;
      }
      code = generateGiftCardCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique gift card code");
    }

    // Calculate expiry date
    const expiresAt = input.expires_in_days
      ? new Date(Date.now() + input.expires_in_days * 24 * 60 * 60 * 1000)
      : null;

    // Create gift card
    const giftCard = await giftCardService.createGiftCards({
      code,
      initial_value: input.initial_value,
      balance: input.initial_value,
      currency_code: input.currency_code,
      purchaser_id: input.purchaser_id || null,
      purchaser_email: input.purchaser_email || null,
      order_id: input.order_id || null,
      recipient_email: input.recipient_email,
      recipient_name: input.recipient_name || null,
      message: input.message || null,
      status: "active",
      used_count: 0,
      purchased_at: new Date(),
      sent_at: null,
      first_used_at: null,
      expires_at: expiresAt,
    });

    // Create purchase transaction
    await giftCardService.createGiftCardTransactions({
      gift_card_id: giftCard.id,
      gift_card_code: giftCard.code,
      type: "purchase",
      amount: input.initial_value,
      balance_after: input.initial_value,
      currency_code: input.currency_code,
      order_id: input.order_id || null,
      cart_id: null,
      customer_id: input.purchaser_id || null,
    });

    return new StepResponse(giftCard, giftCard.id);
  },  async (giftCardId, { container }) => {
    if (!giftCardId) {
      return;
    }

    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);
    await giftCardService.deleteGiftCards(giftCardId);
  }
);