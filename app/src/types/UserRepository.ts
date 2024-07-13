import { db } from "../database";
import { UserUpdate, NewUser, User } from "./types";

export async function createUser(user: NewUser) {
  return await db
    .insertInto("User")
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function findUsers(criteria: Partial<User>) {
  let query = db.selectFrom("User");

  if (criteria.id) {
    query = query.where("id", "=", criteria.id);
  }

  if (criteria.name) {
    query = query.where("name", "=", criteria.name);
  }

  if (criteria.email) {
    query = query.where("email", "=", criteria.email);
  }

  if (criteria.password) {
    query = query.where("password", "=", criteria.password);
  }

  return await query.selectAll().execute();
}

export async function findUser(criteria: Partial<User>) {
  let query = db.selectFrom("User");

  if (criteria.id) {
    query = query.where("id", "=", criteria.id);
  }

  if (criteria.name) {
    query = query.where("name", "=", criteria.name);
  }

  if (criteria.email) {
    query = query.where("email", "=", criteria.email);
  }

  if (criteria.password) {
    query = query.where("password", "=", criteria.password);
  }

  return await query.selectAll().executeTakeFirst();
}

export async function findUserById(id: number) {
  return await db
    .selectFrom("User")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function updateUser(id: number, updateWith: UserUpdate) {
  await db.updateTable("User").set(updateWith).where("id", "=", id).execute();
}

export async function deleteUser(id: number) {
  return await db
    .deleteFrom("User")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
