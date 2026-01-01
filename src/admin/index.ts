import { definePlugin } from "@medusajs/admin-sdk";

export default definePlugin({
  name: "my-giftcard-plugin",
  routes: [
    {
      path: "/giftcards",
      Component: () => import("./routes/giftcards/page"),
    },
    {
      path: "/giftcards/:id",
      Component: () => import("./routes/giftcards/[id]/page"),
    },
  ],
});
