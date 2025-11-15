import { define } from "../utils.ts";
import "../assets/styles.css";

export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Dinkum Save Editor – Edit Encrypted .es3 Files, Player Data &
          Inventory
        </title>
        <meta
          name="description"
          content="Edit your encrypted Dinkum .es3 save files securely in your browser—no uploads required. This offline-first editor supports the latest Dinkum save format, letting you modify player data, inventory, currency, and more, even when other editors no longer work."
        />
        <meta property="og:title" content="Dinkum Save Editor" />
        <meta
          property="og:description"
          content="Edit your encrypted Dinkum .es3 save files securely in your browser—no uploads required. This offline-first editor supports the latest Dinkum save format, letting you modify player data, inventory, currency, and more, even when other editors no longer work."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://dinkum-save-editor.acidworks.deno.net/"
        />
        <meta property="og:image" content="/assets/editor-preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dinkum Save Editor" />
        <meta
          name="twitter:description"
          content="Edit your encrypted Dinkum .es3 save files securely in your browser—no uploads required. This offline-first editor supports the latest Dinkum save format, letting you modify player data, inventory, currency, and more, even when other editors no longer work."
        />
        <meta name="twitter:image" content="/assets/editor-preview.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Dinkum Save Editor" />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="canonical"
          href="https://dinkum-save-editor.acidworks.deno.net/"
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
