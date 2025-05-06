import mongoose from 'mongoose'

const alertThresholdSchema = new mongoose.Schema({
  min: Number,
  max: Number,
  unit: String,
})

const locationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
})

const beaconSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'physical_assets', required: true },
    sensorType: String,
    manufacturer: String,
    model: String,
    firmwareVersion: String,
    calibrationDate: Date,
    nextCalibrationDate: Date,
    batteryLevel: Number,
    connectionType: String,
    reportingInterval: Number,
    alertThresholds: alertThresholdSchema,
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR'],
    },
    location: locationSchema,
  },
  { timestamps: true },
)

export const Beacon = mongoose.model('beacons', beaconSchema)
