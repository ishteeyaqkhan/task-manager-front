"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardCode,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { positionBetween } from "@/lib/position";
import { STATUS_LABELS, TASK_STATUSES, type Task, type TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { TaskColumn } from "./TaskColumn";

type Columns = Record<TaskStatus, string[]>;

/** Pointer sensor for mouse and pen only; touch is handled by TouchSensor (press delay keeps scrolling usable). */
class MouseAndPenSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent }: ReactPointerEvent) =>
        nativeEvent.isPrimary && nativeEvent.button === 0 && nativeEvent.pointerType !== "touch",
    },
  ];
}

function groupByStatus(tasks: Task[]): Columns {
  const columns: Columns = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const task of [...tasks].sort((a, b) => a.position - b.position)) {
    columns[task.status].push(task.id);
  }
  return columns;
}

function statusFromColumnId(id: UniqueIdentifier): TaskStatus | null {
  const value = String(id);
  if (!value.startsWith("column:")) return null;
  const status = value.slice("column:".length) as TaskStatus;
  return TASK_STATUSES.includes(status) ? status : null;
}

function findStatus(id: UniqueIdentifier, columns: Columns): TaskStatus | null {
  return statusFromColumnId(id) ?? TASK_STATUSES.find((status) => columns[status].includes(String(id))) ?? null;
}

interface TaskBoardProps {
  tasks: Task[];
  onMove: (taskId: string, status: TaskStatus, position: number) => void;
  onAddTask: (status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
}

/**
 * Kanban board. While dragging, cards stay in their column (the dragged card leaves a faded
 * placeholder and a DragOverlay follows the pointer/keyboard); the target column is highlighted
 * and same-column cards make room. The new column and index are resolved on drop. Keeping
 * cards in place avoids remounting the active card mid-drag, which breaks keyboard dragging.
 */
export function TaskBoard({ tasks, onMove, onAddTask, onOpenTask }: TaskBoardProps) {
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const baseColumns = useMemo(() => groupByStatus(tasks), [tasks]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  // Order shown right after a drop until the optimistic cache update arrives. It is tied to
  // the `tasks` it was derived from, so it stops applying as soon as new data comes in.
  const [dropped, setDropped] = useState<{ columns: Columns; basedOn: Task[] } | null>(null);
  const columns = dropped && dropped.basedOn === tasks ? dropped.columns : baseColumns;

  // Only real overlaps count; hovering a column resolves to its closest card. With no overlap
  // (e.g. between columns) the last target is kept so the drop target doesn't flicker.
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    let overId = getFirstCollision(hits, "id");
    if (overId == null) {
      return lastOverId.current != null ? [{ id: lastOverId.current }] : [];
    }

    const columnStatus = statusFromColumnId(overId);
    if (columnStatus) {
      const ids = columns[columnStatus].filter((id) => id !== String(args.active.id));
      if (ids.length > 0) {
        overId =
          closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) => ids.includes(String(container.id))),
          })[0]?.id ?? overId;
      }
    }
    lastOverId.current = overId;
    return [{ id: overId }];
  };

  const sensors = useSensors(
    useSensor(MouseAndPenSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Enter is reserved for opening the edit dialog.
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space, KeyboardCode.Enter],
      },
    }),
  );

  const titleOf = (id: UniqueIdentifier) => taskById.get(String(id))?.title ?? "task";
  const describeTarget = (activeTaskId: UniqueIdentifier, overId: UniqueIdentifier) => {
    const status = findStatus(overId, columns);
    if (!status) return "outside the board";
    const column = `${STATUS_LABELS[status]} column`;
    return String(overId) === String(activeTaskId) || statusFromColumnId(overId)
      ? column
      : `${column}, next to ${titleOf(overId)}`;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} is over the ${describeTarget(active.id, over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} was dropped in the ${describeTarget(active.id, over.id)}.`
        : `${titleOf(active.id)} was dropped outside the board. No changes made.`,
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  const resetDrag = () => {
    setActiveId(null);
    setOverStatus(null);
    lastOverId.current = null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setOverStatus(taskById.get(String(active.id))?.status ?? null);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverStatus(over ? findStatus(over.id, columns) : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetDrag();
    const taskId = String(active.id);
    const task = taskById.get(taskId);
    if (!task || !over) return;

    const overId = String(over.id);
    const from = findStatus(taskId, columns);
    const to = findStatus(overId, columns);
    if (!from || !to) return;

    let targetIds: string[];
    if (from === to) {
      const current = columns[from];
      const oldIndex = current.indexOf(taskId);
      const newIndex = statusFromColumnId(overId) ? current.length - 1 : current.indexOf(overId);
      if (newIndex < 0 || newIndex === oldIndex) return;
      targetIds = arrayMove(current, oldIndex, newIndex);
    } else {
      const target = columns[to];
      const overIndex = target.indexOf(overId);
      const dragged = active.rect.current.translated;
      const below =
        dragged !== null && dragged.top + dragged.height / 2 > over.rect.top + over.rect.height / 2;
      const insertAt = overIndex >= 0 ? overIndex + (below ? 1 : 0) : target.length;
      targetIds = [...target.slice(0, insertAt), taskId, ...target.slice(insertAt)];
    }

    const index = targetIds.indexOf(taskId);
    const prev = taskById.get(targetIds[index - 1] ?? "")?.position;
    const next = taskById.get(targetIds[index + 1] ?? "")?.position;

    setDropped({
      columns: { ...columns, [from]: columns[from].filter((id) => id !== taskId), [to]: targetIds },
      basedOn: tasks,
    });
    onMove(taskId, to, positionBetween(prev, next));
  };

  const activeTask = activeId ? taskById.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      // Re-measure drop targets during the drag (cards shift and columns may scroll).
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Press Enter to edit this task. To move it, press Space to pick it up, use the arrow keys to move " +
            "within or between columns, then press Space again to drop it, or Escape to cancel.",
        },
      }}
    >
      {/* Mobile: columns scroll horizontally inside this container only. md+: three columns side by side.
          `relative` makes this the containing block for absolutely positioned descendants (sr-only
          text), so the scroll container clips them instead of letting them widen the page. */}
      <div className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0">
        {TASK_STATUSES.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={columns[status].map((id) => taskById.get(id)).filter((task): task is Task => Boolean(task))}
            highlighted={activeId !== null && overStatus === status}
            onAddTask={onAddTask}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>

      <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
