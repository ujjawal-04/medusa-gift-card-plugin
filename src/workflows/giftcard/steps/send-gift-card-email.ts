import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { GIFTCARD_MODULE } from "../../../modules/giftcard";
import GiftCardModuleService from "../../../modules/giftcard/service";

type SendGiftCardEmailInput = {
  gift_card_id: string;
  gift_card_code: string;
  recipient_email: string;
  recipient_name?: string;
  initial_value: number;
  currency_code: string;
  message?: string;
  purchaser_email?: string;
};

export const sendGiftCardEmailStep = createStep(
  "send-gift-card-email",
  async (input: SendGiftCardEmailInput, { container }) => {
    const giftCardService = container.resolve<GiftCardModuleService>(GIFTCARD_MODULE);

    let emailSent = false;

    // Try to send email notification if notification module is available
    try {
      const notificationService = container.resolve("notification");
      if (notificationService) {
        await notificationService.createNotifications({
          to: input.recipient_email,
          channel: "email",
          template: "gift-card-received",
          data: {
            gift_card_code: input.gift_card_code,
            recipient_name: input.recipient_name || "Customer",
            value: input.initial_value,
            currency: input.currency_code.toUpperCase(),
            message: input.message,
            purchaser_email: input.purchaser_email,
          },
        });
        emailSent = true;
      }
    } catch (error) {
      // Email sending is optional - log but don't fail
      console.log("Email notification skipped:", error instanceof Error ? error.message : "Notification service not available");
    }

    // Update gift card to mark as sent (even if email wasn't actually sent)
    await giftCardService.updateGiftCards({
      id: input.gift_card_id,
      sent_at: new Date(),
    });

    return new StepResponse({ sent: emailSent, email: input.recipient_email });
  }
);