import bcrypt from "bcrypt";
import { validatePassword, validateUser } from "./types/validation";
import { createUser, deleteUser, findUser } from "./types/UserRepository";
import { createFile, deleteFile } from "./types/FileRepository";
import { generateAccessToken } from "./jwt";
import { FileManager } from "./fileManager";
import { upload, authMiddleware } from "./middleware";
import { Request, Response, Router } from "express";
import path from "path";
import * as fs from "fs";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    validatePassword(req.body.password);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUserObject = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    validateUser(newUserObject);
    const user = await createUser(newUserObject);
    const rootFolder = await createFile({
      userId: user.id,
      name: user.email,
      is_folder: true,
    });
    fs.mkdir(path.join(__dirname, `../users/${user.email}`), (err) => {
      if (err) {
        deleteUser(user.id);
        deleteFile(rootFolder.id);
        throw err;
      }
    });
    res.status(200).send("Registered successfully");
  } catch (err) {
    console.log(err);
    res.status(400).send((err as Error).message);
  }
});

// TODO custom redirect
router.post("/login", async (req, res) => {
  try {
    let user = await findUser({
      name: req.body.name,
    });
    if (!user) {
      throw new Error("Invalid username or password");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      throw new Error("Invalid username or password");
    }
    const accessToken = generateAccessToken(user.id);
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.status(200).send("Logged in successfully!");
  } catch (error) {
    res.status(400).send((error as Error).message);
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("user");
    res.status(200).send("Logged out successfully!");
  } catch (error) {
    return res.status(400).send((error as Error).message);
  }
});

router.use(authMiddleware);

router.get("/folderContents", async (req, res) => {
  try {
    // TODO mb use some kind of middleware to prevent defining file manager repeatedly
    const fileManager = new FileManager(req.cookies["user"]);
    // TODO would be great to use parameter instead of body here
    const contents = await fileManager.getDirectoryContents(req.body.path);
    res.status(200).send(contents);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.post("/createFolder", async (req, res) => {
  try {
    const fileManager = new FileManager(req.cookies["user"]);
    await fileManager.createDirectory(req.body.path, req.body.name);
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.post("/deleteFolder", async (req, res) => {
  try {
    const fileManager = new FileManager(req.cookies["user"]);
    await fileManager.deleteDirectory(req.body.path, req.body.name);
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.post("/createFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file was uploaded");
    }
    const file = req.file;
    const fileManager = new FileManager(req.cookies["user"]);
    // TODO couldnt find a way to handle file with file manager.
    fileManager.createFile(req.body.path, file.originalname);
    fs.renameSync(
      file.path,
      path.join(
        __dirname,
        `../users/${req.cookies["user"].email}/${req.body.path}/${file.originalname}`
      )
    );
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

export default router;
