import { db } from "../database";
import { Folder, NewFolder, FolderUpdate } from "./types";

export async function createFolder(Folder: NewFolder) {
  return await db
    .insertInto("Folder")
    .values(Folder)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function findFolderById(id: number) {
  return await db
    .selectFrom("Folder")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function findFolders(criteria: Partial<Folder>) {
  let query = db.selectFrom("Folder");

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

  return await query.selectAll().execute();
}

export function findFolder(criteria: Partial<Folder>) {
  let query = db.selectFrom("Folder");

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

  return query.selectAll().executeTakeFirst();
}

export async function updateFolder(id: number, updateWith: FolderUpdate) {
  await db.updateTable("Folder").set(updateWith).where("id", "=", id).execute();
}

export async function deleteFolder(id: number): Promise<void> {
  await db.deleteFrom("Folder").where("id", "=", id).execute();
}
