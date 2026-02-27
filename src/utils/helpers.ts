export function parseDropdownOptions(options: string | null): string[] {
  if (!options) return [];
  try {
    return JSON.parse(options);
  } catch {
    return [];
  }
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
