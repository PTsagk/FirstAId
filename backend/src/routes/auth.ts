import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: Function) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(401).send("Access Denied");
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};

export { authenticateToken };
