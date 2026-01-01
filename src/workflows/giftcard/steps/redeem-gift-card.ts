import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";

type RedeemGiftCardInput = {
  gift_card_id: string;
  gift_card_code: string;
  amount: number;
  order_id: string;
  cart_id?: string;
  customer_id?: string;
};

export const redeemGiftCardStep = createStep(
  "redeem-gift-card",
  async (input: RedeemGiftCardInput, { container }) => {
    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Get gift card
    const giftCard = await giftCardService.retrieveGiftCard(input.gift_card_id);
    
    const currentBalance = Number(giftCard.balance);
    
    if (currentBalance < input.amount) {
      throw new Error("Insufficient gift card balance");
    }

    // Calculate new balance
    const newBalance = currentBalance - input.amount;

    // Update gift card balance and status
    const updateData: any = {
      id: input.gift_card_id,
      balance: newBalance,
      used_count: giftCard.used_count + 1,
    };

    // Mark as used if balance is depleted
    if (newBalance <= 0) {
      updateData.status = "used";
    }

    // Set first_used_at if this is the first use
    if (giftCard.used_count === 0) {
      updateData.first_used_at = new Date();
    }

    await giftCardService.updateGiftCards(updateData);

    // Create redemption transaction
    const transaction = await giftCardService.createGiftCardTransactions({
      gift_card_id: input.gift_card_id,
      gift_card_code: input.gift_card_code,
      type: "redemption",
      amount: input.amount,
      balance_after: newBalance,
      currency_code: giftCard.currency_code,
      order_id: input.order_id,
      cart_id: input.cart_id || null,
      customer_id: input.customer_id || null,
    });

    return new StepResponse(
      {
        transaction,
        amount_redeemed: input.amount,
        new_balance: newBalance,
      },
      {
        gift_card_id: input.gift_card_id,
        previous_balance: currentBalance,
      }
    );
  },  async (compensationData, { container }) => {
    if (!compensationData) {
      return;
    }

    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Restore previous balance
    const giftCard = await giftCardService.retrieveGiftCard(
      compensationData.gift_card_id
    );

    await giftCardService.updateGiftCards({
      id: compensationData.gift_card_id,
      balance: compensationData.previous_balance,
      used_count: Math.max(0, giftCard.used_count - 1),
      status: compensationData.previous_balance > 0 ? "active" : giftCard.status,
    });
  }
);