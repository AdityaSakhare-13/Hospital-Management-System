const Document = require("../models/Document");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { deleteFile } = require("../services/uploadService");
const logService = require("../services/logService");

// @desc    Upload patient document
// @route   POST /api/documents/upload
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded. Please attach a document.");
  }

  const { patientId, fileType, description } = req.body;

  // Validate patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const document = await Document.create({
    patientId,
    fileUrl: "/uploads/" + req.file.filename,
    fileName: req.file.originalname,
    fileType: fileType || "other",
    uploadedBy: req.user ? req.user._id : null,
    description: description || "",
  });

  // Audit log
  if (req.user) {
    await logService.createLog({
      action: "UPLOAD_DOCUMENT",
      performedBy: req.user._id,
      targetModel: "Document",
      targetId: document._id,
      details: `Uploaded "${req.file.originalname}" for patient ${patient.name}`,
      ipAddress: req.ip,
    });
  }

  return res.status(201).json(
    new ApiResponse(201, document, "Document uploaded successfully")
  );
});

// @desc    Get all documents for a patient
// @route   GET /api/documents/patient/:patientId
exports.getPatientDocuments = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const { fileType, page = 1, limit = 20 } = req.query;

  const query = { patientId: req.params.patientId };
  if (fileType) query.fileType = fileType;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Document.countDocuments(query);

  const documents = await Document.find(query)
    .populate("uploadedBy", "fullName role")
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      documents,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    }, "Patient documents fetched successfully")
  );
});

// @desc    Get single document by ID
// @route   GET /api/documents/:id
exports.getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate("uploadedBy", "fullName role")
    .populate("patientId", "name contact");

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return res.status(200).json(
    new ApiResponse(200, document, "Document fetched successfully")
  );
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // Delete from local storage
  if (document.fileUrl) {
    deleteFile(document.fileUrl);
  }

  await Document.findByIdAndDelete(req.params.id);

  // Audit log
  if (req.user) {
    await logService.createLog({
      action: "DELETE_DOCUMENT",
      performedBy: req.user._id,
      targetModel: "Document",
      targetId: document._id,
      details: `Deleted "${document.fileName}" for patient ${document.patientId}`,
      ipAddress: req.ip,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Document deleted successfully")
  );
});
