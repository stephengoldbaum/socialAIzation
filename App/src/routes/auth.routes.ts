import { Router, Request, Response } from 'express';
import { asyncErrorHandler } from '../middleware/error.middleware';
import { registerUser, loginUser } from '../controllers/auth.controller';

const router = Router();

// Fix body parsing issues
router.post('/register', asyncErrorHandler(async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role: string;
    };

    const user = await registerUser({ email, password, name, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}));

router.post('/login', asyncErrorHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const token = await loginUser({ email, password });
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}));

export default router;