import { error } from "../routes/index.tsx";

export default function ErrorDismiss() {
  if (!error.value) return null;

  return (
    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-dinkum-orange/20 border-2 border-dinkum-accent rounded-lg p-4 flex items-start gap-3">
        <svg
          class="w-5 h-5 text-dinkum-accent flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-dinkum-accent font-mclaren">
            Error
          </h3>
          <p class="text-sm text-dinkum-tertiary mt-1 font-mclaren">
            {error.value}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (error.value = null)}
          class="text-dinkum-accent hover:text-dinkum-tertiary transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
