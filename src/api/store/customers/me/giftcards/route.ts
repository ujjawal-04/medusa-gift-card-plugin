import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { GIFTCARD_MODULE } from "../../../../../modules/giftcard";
import GiftCardModuleService from "../../../../../modules/giftcard/service";

// GET /store/customers/me/giftcards - Get customer's gift cards
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
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    // Get gift cards purchased by customer
    const purchasedCards = await giftCardService.listGiftCards({
      purchaser_id: customerId,
    });

    res.json({
      purchased_gift_cards: purchasedCards,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get gift cards",
    });
  }
};