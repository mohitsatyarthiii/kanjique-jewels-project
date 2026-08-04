import fs from "fs/promises";
import path from "path";
import { Product } from "../models/Product.js";
import { allProductImages, imageFileName, productImageRoot } from "./imageStorage.js";

export const removeUnreferencedProductFiles = async () => {
  const products = await Product.find().select("mainImages variants.images").lean();
  const referenced = new Set(products.flatMap(allProductImages).map(imageFileName).filter(Boolean));
  const entries = await fs.readdir(productImageRoot, { withFileTypes: true });
  await Promise.all(entries.filter(entry => entry.isFile() && !referenced.has(entry.name)).map(async entry => {
    const target = path.join(productImageRoot, entry.name);
    const stat = await fs.stat(target);
    // Avoid racing an upload that has just been promoted but not saved yet.
    if (Date.now() - stat.mtimeMs > 60 * 60 * 1000) await fs.rm(target, { force: true });
  }));
};
