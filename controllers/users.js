import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';
import { handleErrorAsync} from '../statusHandle/handleErrorAsync.js';

const signup = handleErrorAsync(async (req, res, next) => {
    const { email, password, name } = req.body;
    
    if (!name) {
        throw createHttpError(400, '姓名為必填欄位');
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

    res.send({
        status: true,
        token: generateToken({ userId: user._id })
    });
});

const login = handleErrorAsync(async (req, res, next) => {
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
});

const updatePassword = handleErrorAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  console.log(password, confirmPassword, req.user)
  if (!password || !confirmPassword) {
      throw createHttpError(400, '當前密碼和新密碼均為必填欄位');
  }

  if(password !== confirmPassword){
    return next(appError(400, "密碼不一致！", next));
  }

  const user = await UsersModel.findByIdAndUpdate(req.user.userId, {
    password: confirmPassword
  });

  console.log(user)
  generateToken({ userId: user._id })

  res.send({ status: true });
});


const forgetPassword = handleErrorAsync(async (req, res, next) => {

  const { email, code, newPassword } = req.body;
  const user = await UsersModel.findOne({ email }).select('+verificationToken');
  if (!user) {
    throw createHttpError(404, '此使用者不存在');
  }

  const payload = verifyToken(user.verificationToken);
  if (payload.code !== code) {
    throw createHttpError(400, '驗證碼錯誤');
  }

  user.password = await bcrypt.hash(newPassword, 6);
  await user.save();

  res.send({ status: true });
});

const getInfo = handleErrorAsync(async (req, res, next) => {
  res.send({
      status: true,
      result: req.user
  });
});

const updateInfo = handleErrorAsync(async (req, res, next) => {
  const { userId, name, phone, birthday, address } = req.body;

  const updateData = { name, phone, birthday, address };
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const updatedUser = await UsersModel.findByIdAndUpdate(
      userId,
      updateData,
      {
          new: true,
          runValidators: true
      }
  );

  res.send({
      status: true,
      result: updatedUser
  });
});
export {
  signup,
  login,
  updatePassword,
  forgetPassword,
  getInfo,
  updateInfo,
};
