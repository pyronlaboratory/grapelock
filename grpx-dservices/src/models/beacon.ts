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
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'nfts', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'physical_assets' },
    sensorId: { type: String, required: true },
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
      enum: ['inactive', 'active', 'low_battery', 'offline', 'error', 'maintenance', 'decommissioned'],
    },
    location: locationSchema,
  },
  { timestamps: true },
)

export const Beacon = mongoose.model('beacons', beaconSchema)
