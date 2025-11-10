import type { ComponentChildren } from "preact";

export function Footer() {
  return (
    <footer class="bg-dinkum-gray border-t-2 border-dinkum-primary mt-12">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          {/* Main Footer Content */}
          <div class="grid md:grid-cols-2 gap-8 mb-6">
            {/* About Section */}
            <div>
              <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren mb-3">
                About This Editor
              </h3>
              <p class="text-sm text-dinkum-tertiary font-mclaren mb-4">
                All processing happens in your browser. Your save files never
                leave your device.
              </p>

              {/* Encryption Password Callout */}
              <div class="bg-dinkum-primary/20 border-2 border-dinkum-accent rounded-lg p-4 mb-4">
                <h4 class="text-sm font-bold text-dinkum-accent font-mclaren mb-2">
                  🔓 Encryption Password
                </h4>
                <p class="text-sm text-dinkum-tertiary font-mclaren mb-2">
                  Dinkum save files use AES encryption with the password:
                </p>
                <div class="bg-dinkum-gray/50 border border-dinkum-accent/30 rounded px-3 py-2 mb-2">
                  <code class="text-base font-mono text-dinkum-accent font-bold">
                    jamesbendon
                  </code>
                </div>
                <p class="text-xs text-dinkum-tertiary font-mclaren italic">
                  Named after James Bendon, the creator of Dinkum.
                </p>
              </div>

              <p class="text-sm text-dinkum-accent font-bold font-mclaren">
                ⚠️ Always backup your original save files before editing!
              </p>
            </div>

            {/* Attributions Section */}
            <div>
              <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren mb-3">
                Attributions & Credits
              </h3>
              <ul class="space-y-3 text-sm font-mclaren">
                <li class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-dinkum-tertiary">Source code:</span>
                    <a
                      href="https://github.com/ErikMartensson/dinkum-save-editor"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-dinkum-accent hover:text-dinkum-orange underline font-semibold inline-flex items-center gap-1"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      ErikMartensson/dinkum-save-editor
                    </a>
                  </div>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-dinkum-tertiary">
                      Design inspiration:
                    </span>
                    <a
                      href="https://github.com/kieransouth/dinkum-save-editor"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-dinkum-accent hover:text-dinkum-orange underline inline-flex items-center gap-1"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      kieransouth/dinkum-save-editor
                    </a>
                  </div>
                  <span class="text-xs text-dinkum-accent ml-4">
                    (MIT License)
                  </span>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-dinkum-tertiary">
                      Encryption/decryption code:
                    </span>
                    <a
                      href="https://github.com/alextusinean/es3-editor"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-dinkum-accent hover:text-dinkum-orange underline inline-flex items-center gap-1"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      alextusinean/es3-editor
                    </a>
                  </div>
                  <span class="text-xs text-dinkum-accent ml-4">
                    (GPL-3.0 License)
                  </span>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-dinkum-tertiary">McLaren font:</span>
                    <a
                      href="https://fonts.google.com/specimen/McLaren"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-dinkum-accent hover:text-dinkum-orange underline"
                    >
                      Google Fonts
                    </a>
                  </div>
                  <span class="text-xs text-dinkum-accent ml-4">
                    (OFL License)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div class="border-t border-dinkum-primary pt-4 space-y-2">
            <p class="text-sm text-dinkum-tertiary font-mclaren text-center">
              Made with 💛 for the Dinkum community
            </p>
            <div class="text-xs text-dinkum-accent font-mclaren text-center space-y-1">
              <p>
                This is an unofficial fan-made tool. Dinkum is a trademark of
                James Bendon.
              </p>
              <p>
                This tool is provided "as is" without warranty. Use at your own
                risk. The developers are not responsible for any data loss or
                game issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
