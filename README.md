<p align="center">
  <a href="https://www.medusajs.com">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
  </a>
</p>
<h1 align="center">
  Medusa Giftcard Plugin
</h1>

<p align="center">
  Create and view giftcards into your store's right from the Medusa Admin dashboard.
</p>

## Overview

The Medusa Giftcard Plugin is a Plugin for the Medusa Admin dashboard. It provides giftcard's functionalities to create and view giftcards that are active or expired,, all accessible directly within the Medusa Admin panel.


## Getting Started

1. **Install the plugin** in your Medusa project:
   ```bash
   yarn add my-giftcard-plugin
   ```
2. **Add the plugin** to your Medusa backend configuration. In `medusa-config.ts`, add the following to the `plugins` array:

   ```js
   plugins: [
     {
       resolve: 'my-giftcard-plugin',
       options: {},
     },
     // ...other plugins
   ],
   ```

3. **Install dependencies:**
   ```bash
   yarn
   ```
4. **Start your Medusa server:**
   ```bash
   yarn dev
   ```
5. **Access the Giftcard page** from the Medusa Admin dashboard.

## Contributing

I welcome contributions and feedback.
To get involved, [open an issue](https://github.com/ujjawal-04/medusa-gift-card-plugin/issues) or [submit a pull request](https://github.com/ujjawal-04/medusa-gift-card-plugin/pulls) on [GitHub →](https://github.com/ujjawal-04/medusa-gift-card-plugin)
