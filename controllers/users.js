import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';

const signup = async (req, res, next) => {
  try {
      const { email, password, confirmPassword, name } = req.body;
      
      if (!name) {
        throw createHttpError(400, '姓名為必填欄位');
    }
    
      if (password !== confirmPassword) {
          throw createHttpError(400, '兩次輸入的密碼不匹配');
      }

      // 檢查郵箱是否已經註冊
      const checkEmail = await UsersModel.findOne({ email });
      if (checkEmail) {
          throw createHttpError(400, '此 Email 已註冊');
      }

      // 密碼加密
      const hashedPassword = await bcrypt.hash(password, 6);

      // 創建用戶記錄
      const user = await UsersModel.create({
          name,
          email,
          password: hashedPassword
      });

      // 發送帶有 token 的響應
      res.send({
          status: true,
          token: generateToken({ userId: user._id })
      });
  } catch (error) {
      next(error);
  }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UsersModel.findOne({ email }).select('+password');
        if (!user) {
            throw createHttpError(404, '此使用者不存在');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw createHttpError(400, '密碼錯誤');
        }

        res.send({
            status: true,
            token: generateToken({ userId: user._id })
        });
    } catch (error) {
        next(error);
    }
};

export {
  signup,
  login,
};