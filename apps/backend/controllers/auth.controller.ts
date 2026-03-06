import type { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "@repo/schemas";
import prisma from "@repo/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const registerController = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = RegisterSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    const { email, password } = data;

    const isEmailExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExist) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: user,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

const loginController = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = LoginSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      data: { userId: user.id, email: user.email, token },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
    });
  }
};

export { registerController, loginController };
