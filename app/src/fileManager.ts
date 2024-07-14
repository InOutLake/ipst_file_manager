import * as fileR from "./types/FileRepository";
import * as folderR from "./types/FolderRepository";
import { User } from "./types/types";
import * as ur from "./types/UserRepository";
import * as fs from "fs";
import * as p from "path";
import { config } from "./config";
import Request from "express";

class IncorrectPathError extends Error {
  constructor(path: string) {
    super();
    this.message = `Incorrect path: ${path}`;
  }
}

export abstract class AbstractFileManager {
  abstract createDirectoryRecursive(path: string): Promise<string[]>;
  abstract deleteDirectoryRecursive(path: string): Promise<number>;
  abstract getDirectoryContents(path: string): Promise<string[]>;
  abstract createFile(
    path: string,
    name: string,
    fileName: string
  ): Promise<number>;
  abstract deleteFile(path: string, name: string): Promise<number>;
}

export class DbFileManager extends AbstractFileManager {
  userId: number;
  rootParentId: number;
  fileStoragePath: string;

  constructor(userId: number) {
    super();
    this.userId = userId;
    this.fileStoragePath = p.join(__dirname, config.root.uploads);
    this.initialize().catch(console.error);
  }

  async initialize() {
    const root = await folderR.findFolder({
      userId: this.userId,
      parentId: null,
    });
    if (!root) {
      const message = "Could not find root folder for user=" + this.userId;
      console.log("Error on FileManager initialization: " + message);
      throw new Error(message);
    }
    this.rootParentId = root.id;
  }

  async getDestinationFolderId(path: string): Promise<number> {
    const tree = path.split("/");
    let parentId = this.rootParentId;
    while (tree.length > 0) {
      const curFolder = await folderR.findFolder({
        name: tree.shift(),
        parentId: parentId,
        userId: this.userId,
      });
      if (!curFolder) {
        throw new IncorrectPathError(path);
      }
      parentId = curFolder.id;
    }
    return parentId as number;
  }

  // TODO folder name may be included in path. Function could create the whole folder tree
  // TODO how to make a transaction in this scenario?
  // TODO should take root folder and owner id only
  // TODO depricate file system since it is clearly represented in db

  async createDirectoryRecursive(path: string): Promise<string[]> {
    try {
      const que = path.split("/");
      let parentId = this.rootParentId;
      const result: string[] = [];

      while (que.length > 0) {
        const folderName = que.shift();
        if (!folderName) {
          throw new IncorrectPathError(path);
        }
        let folder = await folderR.findFolder({
          parentId: parentId,
          name: folderName,
          userId: this.userId,
        });
        if (!folder) {
          folder = await folderR.createFolder({
            userId: this.userId,
            parentId: parentId,
            name: folderName,
          });
        }
        parentId = folder.id;
        result.push(`Created folder: ${folder.name}`);
      }

      return result;
    } catch (e) {
      console.log("Error while creating directory");
      throw e;
    }
  }

  async deleteDirectoryRecursive(path: string): Promise<number> {
    try {
      const toDeleteId = await this.getDestinationFolderId(path);
      folderR.deleteFolder(toDeleteId);
      return 0;
    } catch (e) {
      console.log("Error while deleting directory");
      throw e;
    }
  }

  async getDirectoryContents(path: string): Promise<string[]> {
    try {
      const folderId = await this.getDestinationFolderId(path);
      const files = await fileR.findFiles({ parentId: folderId });
      const folders = await folderR.findFolders({ parentId: folderId });
      return files
        .map((file) => file.name)
        .concat(folders.map((folder) => folder.name));
    } catch (e) {
      console.log("Error while getting directory contents");
      throw e;
    }
  }

  async createFile(
    path: string,
    name: string,
    filename: string
  ): Promise<number> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      fileR.createFile({
        name: name,
        parentId: parentId,
        userId: this.userId,
        filename: filename,
      });
      return 0;
    } catch (e) {
      console.log("Error while creating file");
      throw e;
    }
  }

  async deleteFile(path: string, name: string): Promise<number> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      const fileToDelete = await fileR.findFile({
        parentId: parentId,
        name: name,
      });
      if (!fileToDelete) {
        throw new Error("No such file or directory");
      }
      const fileId = fileToDelete.id;
      fileR.deleteFile(fileId);
      return 1;
    } catch (e) {
      console.log("Error while deleting file");
      throw e;
    }
  }
}
