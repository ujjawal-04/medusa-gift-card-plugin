import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GIFTCARD_MODULE } from "../../../../modules/giftcard";
import GiftCardModuleService from "../../../../modules/giftcard/service";

type ValidateGiftCardRequest = {
  code: string;
};

// POST /store/giftcards/validate - Validate a gift card code
export const POST = async (
  req: MedusaRequest<ValidateGiftCardRequest>,
  res: MedusaResponse
) => {
  try {
    const { code } = req.validatedBody;

    if (!code) {
      return res.status(400).json({
        error: "Gift card code is required",
      });
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Find gift card
    const giftCards = await giftCardService.listGiftCards({ code });

    if (giftCards.length === 0) {
      return res.status(404).json({
        valid: false,
        error: "Gift card not found",
      });
    }

    const giftCard = giftCards[0];

    // Check status
    if (giftCard.status !== "active") {
      return res.status(400).json({
        valid: false,
        error: `Gift card is ${giftCard.status}`,
        gift_card: {
          code: giftCard.code,
          status: giftCard.status,
        },
      });
    }

    // Check expiry
    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return res.status(400).json({
        valid: false,
        error: "Gift card has expired",
        gift_card: {
          code: giftCard.code,
          status: giftCard.status,
          expires_at: giftCard.expires_at,
        },
      });
    }    // Check balance
    const balance = Number(giftCard.balance);
    if (balance <= 0) {
      return res.status(400).json({
        valid: false,
        error: "Gift card has no remaining balance",
        gift_card: {
          code: giftCard.code,
          balance: 0,
          currency_code: giftCard.currency_code,
        },
      });
    }

    // Valid gift card
    res.json({
      valid: true,
      gift_card: {
        code: giftCard.code,
        balance: giftCard.balance,
        currency_code: giftCard.currency_code,
        status: giftCard.status,
        expires_at: giftCard.expires_at,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to validate gift card",
    });
  }
};