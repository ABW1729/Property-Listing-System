import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export default function (req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = { id: decoded.id };
    next();
  } catch {
    res.sendStatus(403);
  }
}
