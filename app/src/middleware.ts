import { Request, Response, NextFunction } from "express";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken } from "./jwt";
import { findUserById } from "./types/UserRepository";
import multer from "multer";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies["accessToken"];
    if (!accessToken) throw new Error("Access token cookie missing");
    const { userId } = verifyAccessToken(accessToken) as JwtPayload;
    const user = await findUserById(userId);
    if (!user) throw new Error("User not found");
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    res.cookie("user", user, {
      expires: expires,
      httpOnly: true
    });
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      {
        res.clearCookie("accessToken");
        res.clearCookie("user");
        console.log("User have been logged out");
        res.redirect("/login");
      }
    } else {
      console.log((error as Error).message);
      res.send((error as Error).message);
    }
  }
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });
