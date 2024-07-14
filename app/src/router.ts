import bcrypt from "bcrypt";
import { validatePassword, validateUser } from "./types/validation";
import { createUser, findUser } from "./types/UserRepository";
import { createFolder } from "./types/FolderRepository";
import { generateAccessToken } from "./jwt";
import { DbFileManager } from "./fileManager";
import { upload, authMiddleware } from "./middleware";
import { Router } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const router = Router();

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(cookieParser());
router.use(cors());

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
    const rootFolder = await createFolder({
      userId: user.id,
      name: user.email,
    });
    res.status(200).send("Registered successfully");
  } catch (err) {
    console.log(err);
    res.status(400).send((err as Error).message);
  }
});

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
    const fileManager = await new DbFileManager().initialize(
      req.cookies["user"].id
    );
    const contents = await fileManager.getDirectoryContents(
      req.query.path ? (req.query.path as string) : ""
    );
    res.status(200).send(contents);
  } catch (e) {
    res.status(400).send((e as Error).message);
    console.log(e);
  }
});

router.post("/createFolder", async (req, res) => {
  try {
    const fileManager = await new DbFileManager().initialize(
      req.cookies["user"].id
    );
    const result = await fileManager.createDirectoryRecursive(req.body.path);
    res.status(200).send(result);
  } catch (e) {
    res.status(400).send((e as Error).message);
    console.log(e);
  }
});

router.delete("/deleteFolder", async (req, res) => {
  try {
    const fileManager = await new DbFileManager().initialize(
      req.cookies["user"].id
    );
    await fileManager.deleteDirectoryRecursive(req.body.path);
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send((e as Error).message);
    console.log(e);
  }
});

router.post("/createFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file was uploaded");
    }
    const file = req.file;
    const fileManager = await new DbFileManager().initialize(
      req.cookies["user"].id
    );
    await fileManager.createFile(
      req.body.path,
      req.body.name,
      file.originalname
    );
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send((e as Error).message);
    console.log(e);
  }
});

router.delete("/deleteFile", async (req, res) => {
  try {
    const fileManager = await new DbFileManager().initialize(
      req.cookies["user"].id
    );
    const result = await fileManager.deleteFile(req.body.path, req.body.name);
    res.status(200).send("success");
  } catch (e) {
    res.status(400).send((e as Error).message);
    console.log(e);
  }
});

export default router;
