import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, Email and password are required" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const hash = await argon2.hash(password);

    const newUser = await prisma.user.create({
      data: { name, email, password: hash },
    });

    res.status(201).json({ message: "Signed up successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
