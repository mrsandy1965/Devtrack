import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { projectsAPI, tasksAPI } from '../api/services';
import { IconPlus, IconCheck } from '../components/Icons';
import TaskDetailPanel from '../components/TaskDetailPanel';

// ── Priority config ────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  urgent:      { color: 'var(--priority-urgent)',  label: 'Urgent',   dot: '🔴' },
  high:        { color: 'var(--priority-high)',    label: 'High',     dot: '🟠' },
  medium:      { color: 'var(--priority-medium)', label: 'Medium',   dot: '🟡' },
  low:         { color: 'var(--priority-low)',     label: 'Low',      dot: '⚪' },
  no_priority: { color: 'var(--text-muted)',       label: 'No priority', dot: '⬜' },
};

const STATUS_CONFIG = {
  backlog:    { label: 'Backlog',     color: 'var(--status-backlog)'  },
  todo:       { label: 'Todo',        color: 'var(--status-todo)'     },
  in_progress:{ label: 'In Progress', color: 'var(--status-in-progress)' },
  in_review:  { label: 'In Review',   color: 'var(--status-in-review)'},
  done:       { label: 'Done',        color: 'var(--status-done)'     },
  cancelled:  { label: 'Cancelled',   color: 'var(--text-muted)'      },
};

const COLUMNS = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];

// ── Task Card ──────────────────────────────────────────────────────────────────
function PriorityIcon({ priority, size = 14 }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.no_priority;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={config.color}>
      {priority === 'urgent'      && <path d="M8 1a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1zm0 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>}
      {priority === 'high'        && <path d="M2 12l6-8 6 8H2z"/>}
      {priority === 'medium'      && <rect x="2" y="6" width="12" height="4" rx="1"/>}
      {priority === 'low'         && <path d="M2 4l6 8 6-8H2z"/>}
      {priority === 'no_priority' && <circle cx="8" cy="8" r="3" fill="none" stroke={config.color} strokeWidth="2"/>}
    </svg>
  );
}

function TaskCard({ task, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="task-card" onClick={() => onClick(task)}>
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-4" style={{ marginBottom: 6 }}>
          {task.labels.map((l, i) => (
            <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: l.color + '33', color: l.color, fontWeight: 600, letterSpacing: 0.3 }}>
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4, marginBottom: 8, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
        {task.title}
      </div>

      {/* Footer */}
      <div className="flex-between" style={{ alignItems: 'center', marginTop: 'auto' }}>
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <PriorityIcon priority={task.priority} />
          {task.estimate > 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>
              {task.estimate}pt
            </span>
          )}
        </div>
        {task.dueDate && (
          <span style={{ fontSize: 10, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
            {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Quick Add ──────────────────────────────────────────────────────────────────
function QuickAdd({ projectId, status, onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await tasksAPI.create(projectId, { title: title.trim(), status });
      onAdd(res.data.task);
      setTitle('');
      setOpen(false);
    } catch (err) { console.error(err); }
  };

  if (!open) return (
    <button className="quick-add-btn" onClick={() => setOpen(true)}>
      <IconPlus size={13} color="var(--text-muted)" />
      <span>Add task</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="quick-add-form">
      <input autoFocus className="form-input" style={{ fontSize: 13, padding: '6px 10px' }}
        placeholder="Task title…" value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }} />
      <div className="flex gap-6 mt-6">
        <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Add</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

// ── Board Column ───────────────────────────────────────────────────────────────
function BoardColumn({ status, tasks, projectId, onTaskClick, activeId, onAdd }) {
  const config = STATUS_CONFIG[status];
  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="board-column">
      <div className="board-column-header">
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: config.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{config.label}</span>
          <span className="board-column-count">{tasks.length}</span>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="board-column-body">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              isDragging={activeId === task._id}
            />
          ))}
          <QuickAdd projectId={projectId} status={status} onAdd={onAdd} />
        </div>
      </SortableContext>
    </div>
  );
}

// ── Board Page ─────────────────────────────────────────────────────────────────
export default function BoardPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadBoard = useCallback(async () => {
    const [projRes, boardRes] = await Promise.all([
      projectsAPI.get(projectId),
      projectsAPI.getBoard(projectId),
    ]);
    setProject(projRes.data.project);
    setBoard(boardRes.data.board);
  }, [projectId]);

  useEffect(() => {
    loadBoard().finally(() => setLoading(false));
  }, [loadBoard]);

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    // Find source and destination columns
    let srcCol, destCol;
    for (const [col, tasks] of Object.entries(board)) {
      if (tasks.find((t) => t._id === active.id)) srcCol = col;
      if (tasks.find((t) => t._id === over.id))   destCol = col;
    }
    if (!srcCol) return;
    destCol = destCol || srcCol;

    setBoard((prev) => {
      const next = { ...prev };
      const task = next[srcCol].find((t) => t._id === active.id);
      next[srcCol] = next[srcCol].filter((t) => t._id !== active.id);

      const destIdx = next[destCol].findIndex((t) => t._id === over.id);
      const insertAt = destIdx >= 0 ? destIdx : next[destCol].length;
      next[destCol] = [...next[destCol].slice(0, insertAt), { ...task, status: destCol }, ...next[destCol].slice(insertAt)];
      return next;
    });

    // Persist to API
    await tasksAPI.update(active.id, { status: destCol });
    const updatedTasks = board[destCol];
    const updates = updatedTasks.map((t, i) => ({ id: t._id, orderIndex: i, status: destCol }));
    tasksAPI.reorder(updates).catch(console.error);
  };

  const handleTaskAdded = (task) => {
    setBoard((prev) => ({
      ...prev,
      [task.status]: [...(prev[task.status] || []), task],
    }));
  };

  const handleTaskUpdated = (updated) => {
    setBoard((prev) => {
      const next = {};
      for (const [col, tasks] of Object.entries(prev)) {
        next[col] = tasks.filter((t) => t._id !== updated._id);
      }
      next[updated.status] = [...(next[updated.status] || []), updated];
      return next;
    });
    setSelectedTask(null);
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  const activeTask = Object.values(board).flat().find((t) => t._id === activeId);

  return (
    <div className="fade-in board-page">
      {/* Header */}
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
            ← Projects
          </button>
          <span style={{ color: 'var(--border)', fontSize: 18 }}>|</span>
          <h1 className="page-title" style={{ margin: 0, fontSize: 18 }}>{project?.name}</h1>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/issues`)}>
            List View
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/cycles`)}>
            Cycles
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="board-container">
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {COLUMNS.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={board[status] || []}
              projectId={projectId}
              onTaskClick={setSelectedTask}
              activeId={activeId}
              onAdd={handleTaskAdded}
            />
          ))}
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging={false} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          taskId={selectedTask._id}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
        />
      )}
    </div>
  );
}
