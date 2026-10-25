const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const assetValidation = [
  body("assetTag").trim().notEmpty().withMessage("Asset tag is required"),
  body("name").trim().notEmpty().withMessage("Asset name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("serialNumber").trim().notEmpty().withMessage("Serial number is required"),
  body("purchaseCost").isFloat({ min: 0 }).withMessage("Purchase cost must be a non-negative number"),
  body("purchaseDate").isISO8601().withMessage("Purchase date must be a valid date"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
}

function handleError(res, error) {
  console.error(error);

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Asset tag or serial number already exists",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Asset not found",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

app.get("/", (req, res) => {
  res.json({
    message: "Asset Management REST API",
    version: "1.0.0",
    endpoints: {
      create: "POST /api/assets",
      readAll: "GET /api/assets",
      readOne: "GET /api/assets/:id",
      update: "PUT /api/assets/:id",
      delete: "DELETE /api/assets/:id",
      documentation: "GET /api/docs",
    },
  });
});

// CREATE an asset
app.post("/api/assets", assetValidation, validateRequest, async (req, res) => {
  try {
    const asset = await prisma.asset.create({
      data: {
        ...req.body,
        purchaseCost: Number(req.body.purchaseCost),
        purchaseDate: new Date(req.body.purchaseDate),
      },
    });

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// READ all assets
app.get("/api/assets", async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { id: "desc" },
    });

    res.json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// READ one asset
app.get("/api/assets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE an asset
app.put("/api/assets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const existing = await prisma.asset.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const data = { ...req.body };

    if (data.purchaseCost !== undefined) {
      data.purchaseCost = Number(data.purchaseCost);

      if (!Number.isFinite(data.purchaseCost) || data.purchaseCost < 0) {
        return res.status(400).json({
          success: false,
          message: "Purchase cost must be a non-negative number",
        });
      }
    }

    if (data.purchaseDate !== undefined) {
      const date = new Date(data.purchaseDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid purchase date",
        });
      }

      data.purchaseDate = date;
    }

    const allowedFields = [
      "assetTag", "name", "category", "serialNumber", "status",
      "purchaseCost", "purchaseDate", "assignedTo", "location",
      "isUnderWarranty", "notes",
    ];

    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        delete data[key];
      }
    }

    const asset = await prisma.asset.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE an asset
app.delete("/api/assets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const asset = await prisma.asset.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Asset deleted successfully",
      data: asset,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Basic API documentation
app.get("/api/docs", (req, res) => {
  res.json({
    title: "Asset Management API Documentation",
    baseURL: `http://localhost:${PORT}`,
    endpoints: [
      { method: "POST", path: "/api/assets", description: "Create an asset" },
      { method: "GET", path: "/api/assets", description: "List all assets" },
      { method: "GET", path: "/api/assets/:id", description: "Get an asset" },
      { method: "PUT", path: "/api/assets/:id", description: "Update an asset" },
      { method: "DELETE", path: "/api/assets/:id", description: "Delete an asset" },
    ],
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Asset Management API running at http://localhost:${PORT}`);
  console.log(`API documentation: http://localhost:${PORT}/api/docs`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});