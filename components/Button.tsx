import type { ComponentChildren } from "preact";

export interface ButtonProps {
  id?: string;
  onClick?: () => void;
  children?: ComponentChildren;
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      class="px-4 py-2 border-dinkum-primary border-2 rounded-lg bg-dinkum-tertiary text-dinkum-secondary font-mclaren font-bold hover:bg-dinkum-accent hover:text-dinkum-secondary hover:scale-101 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
    />
  );
}
