import { and, asc, eq, lte, ne } from "drizzle-orm";
import db, { initDb } from "../../common/db/sqlite";
import { tasks } from "../../common/db/sqliteSchema";
import { ITask } from "./models";

class TasksRepository {
  async get(id: string) {
    await initDb();
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks._id, id))
      .limit(1)
      .all();
    return rows.at(0);
  }

  async getAll() {
    await initDb();
    return await db.select().from(tasks).orderBy(asc(tasks.date)).all();
  }

  async getOngoing() {
    await initDb();
    return await db
      .select()
      .from(tasks)
      .where(and(lte(tasks.date, new Date()), ne(tasks.done, true)))
      .all();
  }

  async upsert(task: ITask) {
    await initDb();
    const savedTask = (
      await db
        .insert(tasks)
        .values(task)
        .onConflictDoUpdate({
          target: tasks._id,
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

    return savedTask ?? this.get(task._id);
  }

  async delete(id: string) {
    await initDb();
    return await db.delete(tasks).where(eq(tasks._id, id)).run();
  }

  async changeState(id: string, done = true) {
    await initDb();
    return await db.update(tasks).set({ done }).where(eq(tasks._id, id)).run();
  }
}

export default new TasksRepository();
