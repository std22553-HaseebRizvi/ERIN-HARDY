# Embed Chatbot on Any Website

Copy and paste this script before the closing `</body>` tag:

```html
<script
  src="https://YOUR_BACKEND_DOMAIN/widget/chatbot.js"
  data-chatbot-id="YOUR_TENANT_ID"
  data-chatbot-url="https://YOUR_FRONTEND_DOMAIN/widget"
  defer
></script>
```

## Attributes
- `data-chatbot-id`: your tenant/client id.
- `data-chatbot-url`: frontend widget route base.

## Notes
- Works on static sites, Shopify themes, Webflow embeds, and custom CMS pages.
- Mobile responsive by default.
