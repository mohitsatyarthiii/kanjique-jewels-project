import { resolveImageUrl, usePlaceholderOnError } from "../utils/productImages.js";

const ProductImage = ({ src, alt = "Product", ...props }) => (
  <img {...props} src={resolveImageUrl(src)} alt={alt} onError={usePlaceholderOnError} />
);

export default ProductImage;
