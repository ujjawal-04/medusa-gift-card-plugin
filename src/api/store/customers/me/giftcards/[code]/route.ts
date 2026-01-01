import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { GIFTCARD_MODULE } from "../../../../../../modules/giftcard";
import GiftCardModuleService from "../../../../../../modules/giftcard/service";

// GET /store/customers/me/giftcards/:code - Get gift card details and transaction history
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const customerId = req.auth_context?.actor_id;

    if (!customerId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }    const { code } = req.params;
    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Find gift card
    const giftCards = await giftCardService.listGiftCards({ code });

    if (giftCards.length === 0) {
      return res.status(404).json({
        error: "Gift card not found",
      });
    }

    const giftCard = giftCards[0];

    // Verify customer owns this gift card
    if (giftCard.purchaser_id !== customerId) {
      return res.status(403).json({
        error: "You do not have access to this gift card",
      });
    }

    // Get transaction history
    const transactions = await giftCardService.listGiftCardTransactions({
      gift_card_id: giftCard.id,
    });

    res.json({
      gift_card: giftCard,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get gift card details",
    });
  }
};