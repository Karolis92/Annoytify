import { and, asc, eq, lte, ne } from "drizzle-orm";
import db from "../../common/db/sqlite";
import { tasks } from "../../common/db/sqliteSchema";
import { ITask } from "./models";

class TasksRepository {
  getAllQuery() {
    return db.select().from(tasks).orderBy(asc(tasks.date));
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
    return await this.getAllQuery().all();
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

    return savedTask;
  }

  async delete(id: string) {
    return await db.delete(tasks).where(eq(tasks.id, id)).run();
  }

  async changeState(id: string, done = true) {
    return await db.update(tasks).set({ done }).where(eq(tasks.id, id)).run();
  }
}

export default new TasksRepository();
