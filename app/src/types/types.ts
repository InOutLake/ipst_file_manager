import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  User: UserTable;
  File: FileTable;
}

export interface UserTable {
  id: Generated<number>;
  name: string;
  email: string;
  password: string;
}
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface FileTable {
  id: Generated<number>;
  userId: number;
  parentId: number | null;
  is_folder: boolean;
  name: string;
}
export type File = Selectable<FileTable>;
export type NewFile = Insertable<FileTable>;
export type FileUpdate = Updateable<FileTable>;
