import jwt from "jsonwebtoken";
import { TryCatch } from "../middleware/error.js";
import { ErrorHandler } from "../middleware/errorHandler.js";
import { adminSecretKey } from "../app.js";
import Blog from "../model/BlogPost.js";



export const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;
  const isMatched = secretKey === adminSecretKey;

  if (!isMatched) return next(new ErrorHandler("Invalid Admin key", 401));

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  return res.status(200)
    .cookie("Admin-Token", token, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
      domain: ".ananta-techno-client.vercel.app", // << KEY!
      path: "/",
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message: "Authenticated Successfully, Welcome Admin!",
    });
});

export const adminLogout = TryCatch(async (req, res, next) => {
  return res.status(200)
    .clearCookie("Admin-Token", {
      sameSite: "none",
      httpOnly: true,
      secure: true,
      domain: ".ananta-techno-client.vercel.app", // << KEY!
      path: "/",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});






// Return basic admin info (e.g., role)
export const getAdminData = TryCatch(async (req, res) => {
  // If you wish, inspect req.user/token here to confirm admin
  return res.status(200).json({
    success: true,
    admin: true,
  });
});


export const getDashboardStats = TryCatch(async (_req, res) => {
  // 1) Total blog posts
  const blogCount = await Blog.countDocuments();

  // 2) Last 7 days post-counts
  const today = new Date();
  const last7 = new Date(today);
  last7.setDate(today.getDate() - 6);

  const weekPosts = await Blog.find({
    createdAt: { $gte: last7, $lte: today }
  }).select("createdAt").lean();

  const dayMillis = 24 * 60 * 60 * 1000;
  const viewsChart = Array(7).fill(0);
  weekPosts.forEach(({ createdAt }) => {
    const diff = Math.floor((today - new Date(createdAt)) / dayMillis);
    if (diff >= 0 && diff < 7) viewsChart[6 - diff]++;
  });

  // 3) 5 most recent posts
  const recentPosts = await Blog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title createdAt")
    .lean();

  // 4) Activity feed (last 10 updates/creates)
  const actDocs = await Blog.find()
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("title createdAt updatedAt")
    .lean();

  const activity = actDocs.map(doc => ({
    user: "Admin",
    action:
      doc.createdAt.getTime() === doc.updatedAt.getTime()
        ? "created post"
        : "updated post",
    title: doc.title,
    date: doc.updatedAt,
  }));

  return res.status(200).json({
    success: true,
    stats: {
      blogCount,
      commentsCount: 0,      // placeholder
      viewsChart,
      recentPosts,
      activity,
    },
  });
});