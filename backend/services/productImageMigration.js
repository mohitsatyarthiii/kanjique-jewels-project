import mongoose from "mongoose";
import { Product } from "../models/Product.js";

const MIGRATION_ID = "local-product-image-storage-v1";

export const resetLegacyProductImages = async () => {
  const migrations = mongoose.connection.collection("app_migrations");
  if (await migrations.findOne({ _id: MIGRATION_ID })) return;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Product.updateMany({}, { $set: { mainImages: [] } }, { session });
      await Product.updateMany({ "variants.0": { $exists: true } }, { $set: { "variants.$[].images": [] } }, { session });
      await migrations.insertOne({ _id: MIGRATION_ID, completedAt: new Date() }, { session });
    });
  } catch (error) {
    // Standalone MongoDB deployments do not support transactions. The marker is
    // written only after the idempotent reset completes.
    if (!/Transaction numbers are only allowed|replica set/i.test(error.message)) throw error;
    await Product.updateMany({}, { $set: { mainImages: [] } });
    await Product.updateMany({ "variants.0": { $exists: true } }, { $set: { "variants.$[].images": [] } });
    await migrations.updateOne({ _id: MIGRATION_ID }, { $setOnInsert: { completedAt: new Date() } }, { upsert: true });
  } finally {
    await session.endSession();
  }
};
