import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("File")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("userId", "integer", col => col.notNull())
    .addColumn("parentId", "integer") // Define the column first
    .addColumn("name", "varchar(255)", col => col.notNull())
    .addColumn("is_folder", "boolean", col => col.defaultTo(true))
    .addUniqueConstraint("unique_file_name", ["parentId", "name", "userId"])
    .addForeignKeyConstraint("parent_file", ["parentId"], "File", ["id"], cb =>
      cb.onDelete("cascade")
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("File").execute();
}
