import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { purchaseGiftCardWorkflow } from "../../../workflows/giftcard";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";

type CreateGiftCardRequest = {
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

// POST /admin/giftcards - Create a new gift card
export const POST = async (
  req: MedusaRequest<CreateGiftCardRequest>,
  res: MedusaResponse
) => {
  try {
    const { result } = await purchaseGiftCardWorkflow(req.scope).run({
      input: req.body as CreateGiftCardRequest,
    });

    res.json({
      gift_card: result.gift_card,
      email_sent: result.email_sent,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to create gift card",
    });
  }
};

// GET /admin/giftcards - List all gift cards
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    const filters: any = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.recipient_email) {
      filters.recipient_email = req.query.recipient_email;
    }
    
    if (req.query.purchaser_id) {
      filters.purchaser_id = req.query.purchaser_id;
    }

    const [giftCards, count] = await giftCardService.listAndCountGiftCards(
      filters,
      {
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0,
        take: req.query.limit ? parseInt(req.query.limit as string) : 20,
        order: {
          created_at: "DESC",
        },
      }
    );

    res.json({
      gift_cards: giftCards,
      count,
      offset: req.query.offset || 0,
      limit: req.query.limit || 20,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list gift cards",
    });
  }
};