import { db } from "../database";
import { File, NewFile, FileUpdate } from "./types";

export async function createFile(File: NewFile) {
  await db
    .insertInto("File")
    .values(File)
    .execute();
}

export async function findFileById(id: number) {
  return await db
    .selectFrom("File")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function findFiles(criteria: Partial<File>) {
  let query = db.selectFrom("File");

  if (criteria.id) {
    query = query.where("id", "=", criteria.id);
  }

  if (criteria.userId) {
    query = query.where("userId", "=", criteria.userId);
  }

  if (criteria.parentId) {
    query = query.where("parentId", "=", criteria.parentId);
  }

  if (criteria.name) {
    query = query.where("name", "=", criteria.name);
  }
  return await db
    .selectFrom("File")
    .selectAll()
    .execute();
}

export async function updateFile(id: number, updateWith: FileUpdate) {
  await db
    .updateTable("File")
    .set(updateWith)
    .where("id", "=", id)
    .execute();
}

export async function deleteFileById(id: number): Promise<void> {
  await db
    .deleteFrom("File")
    .where("id", "=", id)
    .execute();
}
