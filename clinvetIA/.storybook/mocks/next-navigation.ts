export function usePathname(): string {
  return "/";
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useRouter(): {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
} {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
    prefetch: () => undefined,
  };
}

export function redirect(url: string): never {
  throw new Error(`next/navigation redirect(${url}) is not supported in Storybook`);
}

export function notFound(): never {
  throw new Error("next/navigation notFound() is not supported in Storybook");
}
