import { Module } from "@medusajs/framework/utils";
import GiftCardModuleService from "./service";

export const GIFTCARD_MODULE = "giftcardModule";

export default Module(GIFTCARD_MODULE, {
  service: GiftCardModuleService,
});

export * from "./models";