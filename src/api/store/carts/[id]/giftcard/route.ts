import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { applyGiftCardWorkflow } from "../../../../../workflows/giftcard";

type ApplyGiftCardRequest = {
  code: string;
};

// POST /store/carts/:id/giftcard - Apply gift card to cart
export const POST = async (
  req: MedusaRequest<ApplyGiftCardRequest>,
  res: MedusaResponse
) => {
  try {
    const { id: cartId } = req.params;
    const { code } = req.validatedBody;

    if (!code) {
      return res.status(400).json({
        error: "Gift card code is required",
      });
    }

    // Get cart to calculate total
    const cartService = req.scope.resolve(Modules.CART);
    const cart = await cartService.retrieveCart(cartId, {
      relations: ["items"],
    });

    if (!cart) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }    // Calculate cart total (simplified - you may need to adjust based on your cart structure)
    const cartTotal = Number(cart.total || 0);

    // Apply gift card
    const { result } = await applyGiftCardWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        gift_card_code: code,
        cart_total: cartTotal,
      },
    });    // Update cart metadata to store applied gift card
    await cartService.updateCarts([{
      id: cartId,
      metadata: {
        ...cart.metadata,
        applied_gift_card: {
          code: result.gift_card.code,
          gift_card_id: result.gift_card.id,
          discount_amount: result.application.discount_amount,
        },
      },
    }]);

    res.json({
      message: "Gift card applied successfully",
      gift_card: {
        code: result.gift_card.code,
        balance: result.gift_card.balance,
        discount_amount: result.application.discount_amount,
      },
      cart,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to apply gift card",
    });
  }
};

// DELETE /store/carts/:id/giftcard - Remove gift card from cart
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: cartId } = req.params;

    const cartService = req.scope.resolve(Modules.CART);
    const cart = await cartService.retrieveCart(cartId);

    if (!cart) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }    // Remove gift card from cart metadata
    const metadata = { ...cart.metadata };
    delete metadata.applied_gift_card;

    await cartService.updateCarts([{
      id: cartId,
      metadata,
    }]);

    res.json({
      message: "Gift card removed from cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to remove gift card",
    });
  }
};