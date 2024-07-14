import * as fileR from "./types/FileRepository";
import * as folderR from "./types/FolderRepository";
import * as p from "path";
import { config } from "./config";
import * as fs from "fs";

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
  userId?: number;
  rootParentId?: number;
  fileStoragePath?: string;

  /**
   *  ! Use await obj.initialize() right after constructor
   * */
  constructor() {
    super();
  }

  async initialize(userId: number): Promise<DbFileManager> {
    try {
      this.userId = userId;
      this.fileStoragePath = p.join(__dirname, config.roots.uploads);
      let root = await folderR.findFolder({
        userId: this.userId,
        parentId: null,
      });
      if (!root) {
        root = await folderR.createFolder({
          userId: this.userId as number,
          parentId: null,
          name: `root${this.userId}`,
        });
      }
      this.rootParentId = root.id;
      return this;
    } catch (e) {
      console.log("Error while initializing file manager");
      throw e;
    }
  }

  async getDestinationFolderId(path: string): Promise<number> {
    try {
      let parentId = this.rootParentId;
      let tree = path.split("/");
      if (path === "") {
        return this.rootParentId as number;
      }
      while (tree.length > 0) {
        const curFolder = await folderR.findFolder({
          name: tree.shift(),
          parentId: parentId,
          userId: this.userId,
        });
        if (!curFolder) {
          throw new Error(`Incorrect paht: ${path}`);
        }
        parentId = curFolder.id;
      }
      return parentId as number;
    } catch (e) {
      throw e;
    }
  }

  async createDirectoryRecursive(path: string): Promise<string[]> {
    try {
      const que = path.split("/");
      let parentId = this.rootParentId;
      const result: string[] = [];

      while (que.length > 0) {
        const folderName = que.shift();
        if (!folderName) {
          throw new Error(`Incorrect path ${path}`);
        }
        let folder = await folderR.findFolder({
          parentId: parentId,
          name: folderName,
          userId: this.userId,
        });
        if (!folder) {
          folder = await folderR.createFolder({
            userId: this.userId as number,
            parentId: parentId,
            name: folderName,
          });
          result.push(`Created folder: ${folder.name}`);
        }
        parentId = folder.id;
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
        userId: this.userId as number,
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
      fs.rmSync(p.join(this.fileStoragePath as string, fileToDelete.filename));
      fileR.deleteFile(fileId);
      return 0;
    } catch (e) {
      console.log("Error while deleting file");
      throw e;
    }
  }
}
