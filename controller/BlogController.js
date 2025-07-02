import Blog from '../model/BlogPost.js';
import cloudinary from 'cloudinary';
import multer from 'multer';
import catchAsyncErrors from '../middleware/catchAsyncError.js';


// Setup multer to use memory storage (store files in memory temporarily)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const uploadFileToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder }, (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    ).end(fileBuffer);
  });
};

// ✅ Delete images from Cloudinary
const deleteFromCloudinary = async (publicIds) => {
  try {
    await Promise.all(publicIds.map(id => cloudinary.v2.uploader.destroy(id)));
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }
};



// ✅ Add New Blog
export const createPost = [upload.fields([{ name: 'photos', maxCount: 5 }]), async (req, res) => {
  const { title, content } = req.body;


  // Handle file uploads to Cloudinary
  let photos = [];

  if (req.files?.photos) {
    photos = await Promise.all(
      req.files.photos.map(async (file) => await uploadFileToCloudinary(file.buffer, 'blogs'))
    );
  }

  const newBlogs = await Blog.create({
    title,
    content,
    photos
  });



  await newBlogs.save();

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    blog: newBlogs
  });
}];



// ✅ Get All Posts
export const getAllPosts = catchAsyncErrors(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });;
  res.status(200).json({
    success: true,
    blogs,
  });
});


// ✅ Get Single Banner
export const getPostById = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  res.status(200).json({
    success: true,
    blog,
  });
});


// ✅ Update blog
export const updatePost = [upload.fields([{ name: 'photos', maxCount: 5 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Find the existing blog
    const blogFind = await Blog.findById(id);
    if (!blogFind) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }


    // ✅ Handle Product Image Updates (Delete Old & Upload New)
    if (req.files?.photos) {
      // Delete old photos
      if (blogFind.photos.length > 0) {
        const publicIds = blogFind.photos.map(photo => photo.public_id);
        await deleteFromCloudinary(publicIds);
      }

      // Upload new photos
      blogFind.photos = await Promise.all(
        req.files.photos.map(async (file) => await uploadFileToCloudinary(file.buffer, 'blog'))
      );
    }

    // ✅ Update text fields
    if (title) blogFind.title = title;
    if (content) blogFind.content = content;

    await blogFind.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog: blogFind,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
}];




// ✅ Delete Banner
export const deletePost = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;

  // Find the banner by ID
  const blogFind = await Blog.findById(id);
  if (!blogFind) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }


  // ✅ Delete images from Cloudinary (Only if they exist)
  if (blogFind.photos && blogFind.photos.length > 0) {
    const photoPublicIds = blogFind.photos.map(photo => photo.public_id).filter(id => id); // Remove undefined/null IDs
    if (photoPublicIds.length > 0) {
      await deleteFromCloudinary(photoPublicIds);
    }
  }

  // Delete the banner from the database
  await blogFind.deleteOne();

  // Respond with success message
  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});


