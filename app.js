
// var path = require('path');
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';

var app = express();

mongoose.connect(`mongodb+srv://kelvin80121:${process.env.DB_CONNECTION_STRING}@data.uc1oamo.mongodb.net`)
  .then(res=> console.log("連線資料成功"))
  .catch(err=> console.log("連線資料失敗"));


app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
      success: false,
      message: err.message
  });
});

export default app;
