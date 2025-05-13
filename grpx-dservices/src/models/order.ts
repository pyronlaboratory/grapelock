import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    offerId: { type: String, required: true },
    producerPublicKey: { type: String, required: true },
    consumerPublicKey: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'cancelled_by_producer',
        'cancelled_by_consumer',
        'awaiting_delivery',
        'awaiting_confirmation',
        'completed',
        'failed',
      ],
      default: 'pending',
    },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Order = mongoose.model('orders', orderSchema)
