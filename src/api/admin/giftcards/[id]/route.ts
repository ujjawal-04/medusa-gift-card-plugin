import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GIFTCARD_MODULE } from "../../../../modules/giftcard";
import GiftCardModuleService from "../../../../modules/giftcard/service";

type UpdateGiftCardRequest = {
  balance?: number;
  status?: "active" | "used" | "expired" | "cancelled";
  recipient_name?: string | null;
  message?: string | null;
};

// GET /admin/giftcards/:id - Get a specific gift card
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);
    const { id } = req.params;

    const giftCard = await giftCardService.retrieveGiftCard(id);
    
    // Get transaction history
    const transactions = await giftCardService.listGiftCardTransactions({
      gift_card_id: id,
    });

    res.json({
      gift_card: giftCard,
      transactions,
    });
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "Gift card not found",
    });
  }
};

// PUT /admin/giftcards/:id - Update a gift card
export const PUT = async (
  req: MedusaRequest<UpdateGiftCardRequest>,
  res: MedusaResponse
) => {
  try {
    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);
    const { id } = req.params;
    const body = req.body as UpdateGiftCardRequest;

    const updateData: any = { id };

    if (body.balance !== undefined) {
      updateData.balance = body.balance;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.recipient_name !== undefined) {
      updateData.recipient_name = body.recipient_name;
    }
    if (body.message !== undefined) {
      updateData.message = body.message;
    }

    await giftCardService.updateGiftCards(updateData);
    
    const giftCard = await giftCardService.retrieveGiftCard(id);

    res.json({
      gift_card: giftCard,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to update gift card",
    });
  }
};

// DELETE /admin/giftcards/:id - Cancel or permanently delete a gift card
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const giftCardService = req.scope.resolve<GiftCardModuleService>(GIFTCARD_MODULE);
    const { id } = req.params;
    const { permanent } = req.query;

    const giftCard = await giftCardService.retrieveGiftCard(id);

    // If permanent delete is requested and the card is already cancelled
    if (permanent === "true" && giftCard.status === "cancelled") {
      await giftCardService.deleteGiftCards(id);
      
      res.json({
        message: "Gift card permanently deleted",
        deleted: true,
      });
      return;
    }

    // Otherwise, just cancel it
    await giftCardService.updateGiftCards({
      id,
      status: "cancelled",
    });

    // Create cancellation transaction
    await giftCardService.createGiftCardTransactions({
      gift_card_id: id,
      gift_card_code: giftCard.code,
      type: "cancellation",
      amount: 0,
      balance_after: giftCard.balance,
      currency_code: giftCard.currency_code,
      order_id: null,
      cart_id: null,
      customer_id: null,
    });

    const updatedGiftCard = await giftCardService.retrieveGiftCard(id);

    res.json({
      message: "Gift card cancelled successfully",
      gift_card: updatedGiftCard,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to cancel gift card",
    });
  }
};