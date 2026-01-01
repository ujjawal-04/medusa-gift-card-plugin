import { MedusaService } from "@medusajs/framework/utils";
import GiftCard from "./models/gift-card";
import GiftCardTransaction from "./models/gift-card-transaction";

class GiftCardModuleService extends MedusaService({
  GiftCard,
  GiftCardTransaction,
}) {}

export default GiftCardModuleService;