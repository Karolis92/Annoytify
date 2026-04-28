import { eq } from "drizzle-orm";
import { AppDatabase, getDatabase } from "../../common/db/database";
import { NewTask, Task, tasks } from "../../common/db/schema";

export class TasksRepository {
  constructor(private db: AppDatabase) {}

  selectAll() {
    return this.db.select().from(tasks);
  }

  selectById(id: string) {
    return this.db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  }

  selectUnfinished() {
    return this.db.select().from(tasks).where(eq(tasks.done, false));
  }

  async create(task: NewTask): Promise<Task> {
    const [createdTask] = await this.db.insert(tasks).values(task).returning();
    if (!createdTask) {
      throw new Error("Failed to create task");
    }
    return createdTask;
  }

  async update(task: Task): Promise<Task> {
    const [updatedTask] = await this.db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, task.id))
      .returning();
    if (!updatedTask) {
      throw new Error(`Failed to update task with id ${task.id}`);
    }
    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }
}

const repositoryPromise = getDatabase().then(
  (database) => new TasksRepository(database),
);

export const getTasksRepository = () => repositoryPromise;
