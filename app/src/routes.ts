import bcrypt from "bcrypt";
import { validatePassword, validateUser } from "./types/validation";
import { createUser, findUsers } from "./types/UserRepository";
import { generateAccessToken, verifyAccessToken } from "./jwt";

export async function post_register(req, res) {
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
  } catch (err) {
    return res.status(400).send((err as Error).message);
  }
}

// TODO custom redirect
export async function post_login(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let users = await findUsers({
      name: req.body.username,
      password: hashedPassword
    });
    if (users.length === 0) {
      throw new Error("Invalid username or password");
    }
    let user = users[0];
    const accessToken = generateAccessToken(user.id);
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.redirect("/");
  } catch (error) {
    return res.status(400).send((error as Error).message);
  }
}

export async function get_logout(req, res) {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("user");
    res.redirect("/login");
  } catch (error) {
    return res.status(400).send((error as Error).message);
  }
}

export async function get_folder(req, res) {
  try {
    path = req.params.folder;
    
  }
}
