const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { Admin, Course } = require("../db");
const jwt = require("jsonwebtoken");
const router = Router();

// Admin Routes
router.post("/signup", async (req, res, next) => {
  // Implement admin signup logic
  const { username, password } = req.body;

  if ([username, password].some((field) => field?.trim() === "")) {
    next(new ApiError(400, "Invalid credentials"));
  }

  const adminExist = await Admin.findOne({ username });

  if (adminExist) {
    next(new ApiError(400, "Admin with this username already exists"));
  }

  try {
    const adminCreated = await Admin.create({
      username,
      password,
    });

    res
      .status(201)
      .json(new ApiResponse(201, adminCreated, "Amdin created successfully"));
  } catch (error) {
    next(new ApiError(400, "Admin creation failed", error));
  }
});

router.post("/signin", async (req, res, next) => {
  // Implement admin signup logic
  const { username, password } = req.body;
  if ([username, password].some((field) => field?.trim() === "")) {
    next(new ApiError(400, "Invalid username or password"));
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    next(new ApiError(400, "Admin not found"));
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    next(new ApiError(400, "Password didn't match"));
  }

  const token = jwt.sign({ username }, "secret-key");
  res.set("Authorization", `Bearer ${token}`);

  res.status(200).json(new ApiResponse(200, admin, "Admin login successfully"));
});

router.post("/courses", adminMiddleware, async (req, res, next) => {
  // Implement course creation logic

  const { title, description, imageLink, price } = req.body;

  if (
    [title, description, imageLink, String(price)].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    next(new ApiError(400, "Invalid credentials"));
  }
  try {
    const course = await Course.create({
      title,
      description,
      imageLink,
      price,
    });

    res.json(
      new ApiResponse(
        200,
        `course_ID: ${course._id}`,
        "Course added successfully"
      )
    );
  } catch (error) {
    next(new ApiError(400, "Course creation failed"));
  }
});

router.get("/courses", adminMiddleware, async (req, res, next) => {
  // Implement fetching all courses logic

  try {
    const courses = await Course.find({});
    res.json(new ApiResponse(200, courses, "All course"));
  } catch (error) {
    next(new ApiError(400, "course not found"));
  }
});

module.exports = router;
