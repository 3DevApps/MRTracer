const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const fSync = require("fs");
const { jobManager } = require("../instances.js");
const gltfToGlb = require("./gltfToGlb.js");

// Configure multer for file upload
const upload = multer({
  dest: path.join(__dirname, "../tmp"),
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Utility function to clean up files
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error);
    }
  }
}

// Validate files middleware
function validateFiles(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files were uploaded");
  }

  const hasGlb = req.files.some((file) =>
    file.originalname.toLowerCase().endsWith(".glb")
  );
  const hasGltf = req.files.some((file) =>
    file.originalname.toLowerCase().endsWith(".gltf")
  );

  if (!hasGlb && !hasGltf) {
    return res.status(400).send("Neither GLB nor GLTF file found in upload");
  }

  next();
}

// File upload endpoint
app.post("/upload", upload.any(), validateFiles, async (req, res) => {
  const filesToCleanup = [];
  let outputPath = null;

  try {
    const jobId = req.query.jobId;
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    // Track uploaded files for cleanup
    req.files.forEach((file) => filesToCleanup.push(file.path));

    const glbFile = req.files.find((file) =>
      file.originalname.toLowerCase().endsWith(".glb")
    );

    if (glbFile) {
      // If GLB file is uploaded directly, just use it
      outputPath = glbFile.path;
    } else {
      // Convert GLTF to GLB
      const result = await gltfToGlb(req.files);

      // Write output file
      outputPath = path.join(path.dirname(req.files[0].path), `${jobId}.glb`);
      await fs.writeFile(outputPath, result.buffer);
      filesToCleanup.push(outputPath);
    }

    // Verify the output file exists
    if (!fSync.existsSync(outputPath)) {
      throw new Error("Output file was not created successfully");
    }

    // Send file to job manager
    await jobManager.sendFile(jobId, outputPath, `${jobId}.glb`);

    res.status(200).json({
      success: true,
      message: "File uploaded and processed successfully",
      jobId: jobId,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({
      success: false,
      message: `Error processing upload: ${error.message}`,
      jobId: req.query.jobId,
    });
  } finally {
    try {
      await cleanupFiles(filesToCleanup);
    } catch (cleanupError) {
      console.error("Error during file cleanup:", cleanupError);
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

module.exports = app;
