const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const TaskController = require('../controllers/TaskController');

router.use(protect);

// ── Static routes FIRST (must be before /:id to avoid Express matching id='search') ──
router.post  ('/reorder',  TaskController.reorderTasks);
router.get   ('/search',   TaskController.search);

// ── Task CRUD (dynamic :id) ───────────────────────────────────────────────────
router.get   ('/:id',               TaskController.getTask);
router.patch ('/:id',               TaskController.updateTask);
router.delete('/:id',               TaskController.deleteTask);

// ── Comments ──────────────────────────────────────────────────────────────────
router.post  ('/:id/comments',            TaskController.addComment);
router.delete('/:id/comments/:commentId', TaskController.deleteComment);

module.exports = router;
