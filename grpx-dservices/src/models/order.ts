import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    offerId: { type: String, required: true },
    producerPublicKey: { type: String, required: true },
    consumerPublicKey: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'awaiting_delivery',
        'awaiting_confirmation',
        'cancelled_by_producer',
        'cancelled_by_consumer',
        'completed',
        'failed',
      ],
      default: 'awaiting_delivery',
    },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Order = mongoose.model('orders', orderSchema)
