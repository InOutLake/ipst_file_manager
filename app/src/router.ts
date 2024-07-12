import bcrypt from "bcrypt";
import { validatePassword, validateUser } from "./types/validation";
import { createUser, findUsers } from "./types/UserRepository";
import { createFile } from "./types/FileRepository";
import { generateAccessToken, verifyAccessToken } from "./jwt";
import { FileManager, AbstractFileManager } from "./fileManager";
import { upload, authMiddleware } from "./middleware";
import { Request, Response, Router } from "express";
import * as fs from "fs";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    validatePassword(req.body.password);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUserObject = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    };
    validateUser(newUserObject);
    const user = await createUser(newUserObject);
    const rootFolder = await createFile({
      userId: user.id,
      name: user.email,
      is_folder: true
    });
  } catch (err) {
    res.status(400).send((err as Error).message);
  }
});

// TODO custom redirect
router.post("/login", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let users = await findUsers({
      name: req.body.name,
      password: hashedPassword
    });
    if (users.length === 0) {
      throw new Error("Invalid username or password");
    }
    let user = users[0];
    const accessToken = generateAccessToken(user.id);
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.status(200).send("Logged in successfully!");
    res.redirect("/");
  } catch (error) {
    res.status(400).send((error as Error).message);
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("user");
    res.redirect("/login");
  } catch (error) {
    return res.status(400).send((error as Error).message);
  }
});

router.use(authMiddleware);

router.get("/folderContents", async (req, res) => {
  try {
    // TODO mb use some kind of middleware to prevent defining file manager repeatedly
    const fileManager = new FileManager(req.cookies["user"].id);
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
    const fileManager = new FileManager(req.cookies["user"].id);
    await fileManager.createDirectory(req.body.path, req.body.name);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.post("/deleteFolder", async (req, res) => {
  try {
    const fileManager = new FileManager(req.cookies["user"].id);
    await fileManager.deleteDirectory(req.body.path, req.body.name);
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
    const fileManager = new FileManager(req.cookies["user"].id);
    // TODO couldnt find a way to handle file with file manager.
    fileManager.createFile(req.body.path, file.originalname);
    await fs.rename(file.path, req.body.path, err => {
      if (err) throw err;
    });
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

export default router;
