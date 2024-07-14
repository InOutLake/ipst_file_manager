import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  User: UserTable;
  File: FileTable;
  Folder: FolderTable;
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
  name: string;
  filename: string;
}
export type File = Selectable<FileTable>;
export type NewFile = Insertable<FileTable>;
export type FileUpdate = Updateable<FileTable>;

export interface FolderTable {
  id: Generated<number>;
  userId: number;
  parentId: number | null;
  name: string;
}
export type Folder = Selectable<FolderTable>;
export type NewFolder = Insertable<FolderTable>;
export type FolderUpdate = Updateable<FolderTable>;
