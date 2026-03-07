import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Unauthorized",
    });
  }

  const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Unauthorized",
    });
  }

  req.userId = decodedToken.id;

  next();
};

export default authMiddleware;
