const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const ApiError = require("../utils/ApiError");
const { User, Course } = require("../db");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

// User Routes
router.post("/signup", async (req, res, next) => {
  // Implement user signup logic
  const { username, password } = req.body;

  if ([username, password].some((fields) => fields?.trim() === "")) {
    next(new ApiError(400, "All fields are required"));
  }

  const user = await User.findOne({ username });
  if (user) {
    next(new ApiError(400, "User already exists with their username"));
  }

  try {
    const userCreated = await User.create({
      username,
      password,
    });

    res.json(new ApiResponse(201, userCreated, "User created successfully"));
  } catch (error) {
    next(new ApiError(400, "User creation failed"));
  }
});

router.post("/signin", async (req, res, next) => {
  // Implement admin signup logic
  const { username, password } = req.body;

  if ([username, password].some((field) => field?.trim() === "")) {
    next(new ApiError(404, "Invald credentials"));
  }

  const user = await User.findOne({ username });

  if (!user) {
    next(new ApiError(404, "User not found"));
  }
  try {
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return next(new ApiError(400, "Password didn't match"));
    }

    const token = jwt.sign({ username }, "secret-key");
    res.set("Authorization", `Bearer ${token}`);

    res.json(new ApiResponse(200, user, "User login successfully"));
  } catch (error) {
    next(new ApiError(400, "User login failed"));
  }
});

router.get("/courses", async (req, res) => {
  // Implement listing all courses logic
  try {
    const courses = await Course.find({});
    res.json(new ApiResponse(200, courses, "All Courses"));
  } catch (error) {
    next(new ApiError(400, "Internal Server Error"));
  }
});

router.post("/courses/:courseId", userMiddleware, async (req, res, next) => {
  // Implement course purchase logic

  const courseId = req.params.courseId;
  if (!courseId) {
    next(new ApiError(400, "Invalid course id"));
  }

  try {
    const username = req.user;

    await User.updateOne(
      {
        username,
      },
      {
        $push: {
          purchasedCourse: courseId,
        },
      }
    );

    res.json(
      new ApiResponse(
        200,
        `Course Id: ${courseId}`,
        "Course purchased successfully"
      )
    );
  } catch (error) {
    next(new ApiError(400, "Failed to purchase course"));
  }
});

router.get("/purchasedCourses", userMiddleware, async (req, res, next) => {
  // Implement fetching purchased courses logic
  const username = req.user;

  try {
    const user = await User.findOne({ username });
    const courses = await Course.find({
      _id: {
        $in: user.purchasedCourse,
      },
    });

    res.json(new ApiResponse(200, courses, "All purchased courses"));
  } catch (error) {
    next(new ApiError(400, "Internal server error", error));
  }
});

module.exports = router;
