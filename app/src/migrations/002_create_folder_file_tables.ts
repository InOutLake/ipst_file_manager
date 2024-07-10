import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("File")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("userId", "integer", col => col.notNull())
    .addColumn("parentId", "integer")
    .addColumn("name", "varchar(255)", col => col.notNull())
    .addColumn("parentless", "boolean", col => col.defaultTo(false))
    .addUniqueConstraint("unique_File_name", ["parentId", "name"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("File").execute();
}
