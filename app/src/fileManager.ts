import * as fr from "./types/FileRepository";

class IncorrectPathError extends Error {
  constructor(path: string, name: string) {
    super();
    this.message = `Incorrect path: ${path}/${name}`;
  }
}

abstract class AbstractFileManager {
  abstract createDirectory(path: string, name: string): Promise<void>;
  abstract deleteDirectory(path: string, name: string): Promise<void>;
  abstract getDirectoryContents(path: string): Promise<string[]>;
  abstract createFile(path: string, name: string): Promise<void>;
  abstract deleteFile(path: string, name: string): Promise<void>;
}

class FileManager extends AbstractFileManager {
  userId: number;
  constructor(userId: number) {
    super();
    this.userId = userId;
  }

  async getDestinationFolderId(path: string): Promise<number> {
    const tree = path.split("/");
    let parentId: number | null = null;
    while (tree.length > 0) {
      const cFolder = await fr.findFile({
        name: tree.shift(),
        parentId: parentId,
        userId: this.userId,
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
      fr.createFile({
        name: name,
        parentId: parentId,
        userId: this.userId,
        is_folder: true
      });
      return;
    } catch (e) {
      console.log(e);
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
      const folderId = folderToDelete.id;
      fr.deleteFileById(folderId);
      return;
    } catch (e) {
      console.log(e);
    }
  }

  async getDirectoryContents(path: string): Promise<string[]> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      const name = path.split("/").pop();
      const folder = await fr.findFile({
        parentId: parentId,
        name: name,
        userId: this.userId
      });
      if (!folder) {
        throw new IncorrectPathError(path, "");
      }
      const folderId = folder.id;
      const files = await fr.findFiles({ parentId: folderId });
      return files.map(file => file.name);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async createFile(path: string, name: string): Promise<void> {
    try {
      const parentId = await this.getDestinationFolderId(path);
      fr.createFile({
        name: name,
        parentId: parentId,
        userId: this.userId,
        is_folder: false
      });
      return;
    } catch (e) {
      console.log(e);
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
      console.log(e);
    }
  }
}
