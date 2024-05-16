import { Router } from 'express';
import { 
  login, 
  signup,
  forgetPassword,
  updatePassword,
  getInfo,
  updateInfo,
} from '../controllers/users.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';

const router = Router();

router.use(checkRequestBodyValidator);

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgetPassword', forgetPassword);
router.put('/updatePassword',  updatePassword);
router.get('/profile', isAuth, getInfo);
router.put('/profile', isAuth, updateInfo);


export default router;
