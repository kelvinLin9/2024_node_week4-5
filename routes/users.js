import { Router } from 'express';
import { 
  login, 
  signup,
} from '../controllers/users.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';

const router = Router();

router.use(checkRequestBodyValidator);

router.post('/login', login);
router.post('/signup', signup);

export default router;
