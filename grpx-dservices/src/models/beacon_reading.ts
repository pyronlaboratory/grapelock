import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
})

const beaconReadingSchema = new mongoose.Schema(
  {
    sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'beacons', required: true },
    timestamp: { type: Date, required: true },
    readingType: String,
    value: Number,
    unit: String,
    isAbnormal: Boolean,
    batteryLevel: Number,
    signalStrength: Number,
    location: locationSchema,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const BeaconReading = mongoose.model('beacon_readings', beaconReadingSchema)
