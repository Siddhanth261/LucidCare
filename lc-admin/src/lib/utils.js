// Utility: merge Tailwind classes safely
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Utility: generate a URL for a given page
export function createPageUrl(pageName) {
  if (!pageName) return "/";
  return "/" + pageName.toLowerCase();
}
