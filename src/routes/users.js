const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  promoteUser,
  getAllTechnicians
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getAllUsers);
router.post("/", verifyToken, createUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id/promote", verifyToken, promoteUser);
router.get("/technicians", verifyToken, getAllTechnicians);

module.exports = router;
