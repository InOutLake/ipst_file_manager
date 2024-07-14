import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("Folder")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("userId", "integer", (col) => col.notNull())
    .addColumn("parentId", "integer")
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addUniqueConstraint("unique_folder_name", ["parentId", "name", "userId"])
    .addForeignKeyConstraint(
      "folder_parent_folder",
      ["parentId"],
      "Folder",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
    .execute();

  await db.schema
    .createTable("File")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("userId", "integer", (col) => col.notNull())
    .addColumn("parentId", "integer")
    .addColumn("filename", "varchar(255)")
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addUniqueConstraint("unique_file_name", ["parentId", "name", "userId"])
    .addForeignKeyConstraint(
      "parent_file",
      ["parentId"],
      "Folder",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("File").execute();
  await db.schema.dropTable("Folder").execute();
}
