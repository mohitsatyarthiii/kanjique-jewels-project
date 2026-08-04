const apiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || "";

const apiOrigin = (() => {
  try {
    return new URL(apiBase || window.location.origin, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

export const PRODUCT_PLACEHOLDER = "/product-placeholder.svg";

export const resolveImageUrl = value => {
  const url = typeof value === "string" ? value : value?.url;
  if (!url) return PRODUCT_PLACEHOLDER;
  if (/^(blob:|data:|https?:\/\/)/i.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getProductImage = product => resolveImageUrl(
  product?.mainImages?.[0] || product?.images?.[0] || product?.image || product?.imageUrl
);

export const usePlaceholderOnError = event => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = PRODUCT_PLACEHOLDER;
};
