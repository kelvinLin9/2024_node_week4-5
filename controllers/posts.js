import PostModel from '../models/post.js';
import createHttpError from 'http-errors';

function sendResponse(res, statusCode, data, message = '') {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    success: false,
    message
  });
}

export const getPosts = async(req, res, next) => {
  try {
      const { page = 1, limit = 10, sort = 'desc', keyword = '' } = req.query;

      let query = {};
      if (keyword) {
          query.content = { $regex: keyword, $options: 'i' };
      }

      let sortOptions = { createdAt: sort === 'asc' ? 1 : -1 };

      const posts = await PostModel.find(query)
                                  .populate('userId', 'name email')
                                  .skip((page - 1) * limit)
                                  .limit(limit)
                                  .sort(sortOptions)
                                  .exec();

      sendResponse(res, 200, posts);
  } catch (error) {
      next(createHttpError(500, 'Server error retrieving posts'));
  }
};



export const getPost = async(req, res, next) => {
  try {
      const post = await PostModel.findById(req.params.id)
                                 .populate('userId', 'name email')
                                 .exec();
      if (!post) {
          return sendError(res, 404, 'Post not found');
      }
      sendResponse(res, 200, post);
  } catch (error) {
      next(createHttpError(500, 'Server error retrieving post'));
  }
};


export const createPost = async(req, res, next) => {
  try {
      const { userId } = req.body;  // 從請求體中提取 userId
      if (!userId) {
          return sendError(res, 400, 'User ID is required');
      }
      const post = new PostModel({
          ...req.body,
          userId
      });
      const savedPost = await post.save();
      sendResponse(res, 201, savedPost, 'Post created successfully');
  } catch (error) {
      next(error);
  }
};



export const updatePost = async(req, res, next) => {
    try {
        const post = await PostModel.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true,
        });
        if (!post) {
            return sendError(res, 404, 'Post not found');
        }
        sendResponse(res, 200, post, 'Post updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deletePost = async(req, res, next) => {
    try {
        const post = await PostModel.findByIdAndDelete(req.params.id);
        if (!post) {
            return sendError(res, 404, 'Post not found');
        }
        sendResponse(res, 200, post, 'Post deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const deletePosts = async (req, res, next) => {
  try {
      const result = await PostModel.deleteMany({});
      if (result.deletedCount === 0) {
          return sendError(res, 404, 'No posts found to delete');
      }
      sendResponse(res, 200, {}, `${result.deletedCount} posts deleted successfully`);
  } catch (error) {
      next(error);
  }
};
