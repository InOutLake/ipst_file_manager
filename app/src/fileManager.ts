import * as fr from "./types/FileRepository";
import { User } from "./types/types";
import * as ur from "./types/UserRepository";
import * as fs from "fs";
import Request from "express";

class IncorrectPathError extends Error {
  constructor(path: string, name: string) {
    super();
    this.message = `Incorrect path: ${path}/${name}`;
  }
}

export abstract class AbstractFileManager {
  abstract createDirectory(path: string, name: string): Promise<void>;
  abstract deleteDirectory(path: string, name: string): Promise<void>;
  abstract getDirectoryContents(path: string): Promise<string[]>;
  abstract createFile(path: string, name: string, file: File): Promise<void>;
  abstract deleteFile(path: string, name: string): Promise<void>;
}

export class FileManager extends AbstractFileManager {
  user: User;
  constructor(user: User) {
    super();
    this.user = user;
  }

  async getDestinationFolderId(path: string): Promise<number> {
    const tree = path.split("/");
    let parentId: number | null = null;
    while (tree.length > 0) {
      const cFolder = await fr.findFile({
        name: tree.shift(),
        parentId: parentId,
        userId: this.user.id,
        is_folder: true
      });
      if (!cFolder) {
        throw new IncorrectPathError(path, "");
      }
      parentId = cFolder.id;
    }
    return parentId as number;
  }

  // TODO folder name may be included in path. Function could create the whole folder tree
  async createDirectory(path: string, name: string): Promise<void> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      await fs.mkdir(`../users/${this.user.email}/${path}/${name}`, err => {
        if (err) {
          throw new Error("Folder creation failed");
        }
      });
      const file = await fr.createFile({
        name: name,
        parentId: parentId,
        userId: this.user.id,
        is_folder: true
      });
      return;
    } catch (e) {
      throw e;
    }
  }

  async deleteDirectory(path: string, name: string): Promise<void> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      const folderToDelete = await fr.findFile({
        parentId: parentId,
        name: name
      });
      if (!folderToDelete) {
        throw new IncorrectPathError(path, name);
      }
      await fs.rm(`../users/${this.user.email}/${path}/${name}`, err => {
        throw new Error("Folder deletion failed");
      });
      const folderId = folderToDelete.id;
      fr.deleteFileById(folderId);
      return;
    } catch (e) {
      throw e;
    }
  }

  async getDirectoryContents(path: string): Promise<string[]> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      const name = path.split("/").pop();
      const folder = await fr.findFile({
        parentId: parentId,
        name: name,
        userId: this.user.id
      });
      if (!folder) {
        throw new IncorrectPathError(path, "");
      }
      const folderId = folder.id;
      const files = await fr.findFiles({ parentId: folderId });
      return files.map(file => file.name);
    } catch (e) {
      throw e;
      return [];
    }
  }

  // TODO couldnt find the way to handle multer file
  async createFile(path: string, name: string): Promise<void> {
    try {
      const parentId = await this.getDestinationFolderId(path);

      fr.createFile({
        name: name,
        parentId: parentId,
        userId: this.user.id,
        is_folder: false
      });
      return;
    } catch (e) {
      throw e;
    }
  }

  async deleteFile(path: string, name: string): Promise<void> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      const folderToDelete = await fr.findFile({
        parentId: parentId,
        name: name
      });
      if (!folderToDelete) {
        throw new IncorrectPathError(path, name);
      }
      const folderId = folderToDelete.id;
      fr.deleteFileById(folderId);
      return;
    } catch (e) {
      throw e;
    }
  }
}
