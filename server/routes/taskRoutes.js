const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const TaskController = require('../controllers/TaskController');

router.use(protect);

// ── Task CRUD ─────────────────────────────────────────────────────────────────
router.get   ('/:id',               TaskController.getTask);
router.patch ('/:id',               TaskController.updateTask);
router.delete('/:id',               TaskController.deleteTask);

// ── Drag-drop reorder ─────────────────────────────────────────────────────────
router.post  ('/reorder',           TaskController.reorderTasks);

// ── Comments ──────────────────────────────────────────────────────────────────
router.post  ('/:id/comments',                    TaskController.addComment);
router.delete('/:id/comments/:commentId',         TaskController.deleteComment);

// ── Global search ─────────────────────────────────────────────────────────────
router.get   ('/search',            TaskController.search);

module.exports = router;
