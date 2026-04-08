const express = require("express");
const router = express.Router();
const doctorEventController = require("../controllers/doctorEventController");
const {
  createDoctorEventValidator,
  doctorEventIdValidator,
  doctorIdParamValidator,
  updateEventStatusValidator,
} = require("../validators/doctorEventValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Get doctor-specific events (must be before /:id routes)
router.get(
  "/doctor/:doctorId",
  protect,
  doctorIdParamValidator,
  validate,
  doctorEventController.getDoctorEvents
);

// Base routes
router
  .route("/")
  .post(
    protect,
    authorize("admin", "doctor"),
    createDoctorEventValidator,
    validate,
    doctorEventController.createDoctorEvent
  )
  .get(
    protect,
    authorize("admin", "reception"),
    doctorEventController.getAllDoctorEvents
  );

// Update event status (approve/reject)
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateEventStatusValidator,
  validate,
  doctorEventController.updateEventStatus
);

// Delete event
router.delete(
  "/:id",
  protect,
  authorize("admin", "doctor"),
  doctorEventIdValidator,
  validate,
  doctorEventController.deleteDoctorEvent
);

module.exports = router;
