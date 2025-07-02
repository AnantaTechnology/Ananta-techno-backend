import mongoose from "mongoose";



const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    photos: [
        {
            public_id: {
                type: String,
                required: [true, "Please enter Public ID"],
            },
            url: {
                type: String,
                required: [true, "Please enter URL"],
            },
        },
    ],
}, { timestamps: true });




const Blog = mongoose.model('Blog', BlogPostSchema);

export default Blog;
