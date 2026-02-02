import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  bulkDeleteUsers,
  bulkActivateUsers,
  bulkDeactivateUsers,
  getUserStats
} from "../controllers/adminController.js";


const router = express.Router();

router.use(requireAuth, requireAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Bulk operations
router.post("/users/bulk-delete", bulkDeleteUsers);
router.post("/users/bulk-activate", bulkActivateUsers);
router.post("/users/bulk-deactivate", bulkDeactivateUsers);


router.get("/dashboard", (req, res) => {
  res.json({ ok: true, message: `Hello Admin ${req.user.name}` });
});

export default router;
