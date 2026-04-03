import { and, asc, eq, lte, ne } from "drizzle-orm";
import db from "../../common/db/sqlite";
import { tasks } from "../../common/db/sqliteSchema";
import { ITask } from "./models";

class TasksRepository {
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  async get(id: string) {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1)
      .all();
    return rows.at(0);
  }

  async getAll() {
    return await db.select().from(tasks).orderBy(asc(tasks.date)).all();
  }

  async getOngoing() {
    return await db
      .select()
      .from(tasks)
      .where(and(lte(tasks.date, new Date()), ne(tasks.done, true)))
      .all();
  }

  async upsert(task: ITask) {
    const savedTask = (
      await db
        .insert(tasks)
        .values(task)
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            title: task.title,
            description: task.description,
            date: task.date,
            repeat: task.repeat,
            done: task.done,
          },
        })
        .returning()
        .all()
    ).at(0);

    if (!savedTask) {
      throw new Error(`Failed to upsert task with id ${task.id}.`);
    }

    this.notify();
    return savedTask;
  }

  async delete(id: string) {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).run();
    this.notify();
    return result;
  }

  async changeState(id: string, done = true) {
    const result = await db
      .update(tasks)
      .set({ done })
      .where(eq(tasks.id, id))
      .run();
    this.notify();
    return result;
  }
}

export default new TasksRepository();
