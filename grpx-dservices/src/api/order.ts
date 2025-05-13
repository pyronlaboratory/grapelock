import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getOrders } from '../services/order.js'

const router = Router()

router.get('/:pubicKey', async (req, res) => {
  try {
    const orders = await getOrders(req.params.pubicKey)
    if (!orders || orders.length === 0) {
      res.status(404).json(errorResponse('Orders not found', 'ORDERS_NOT_FOUND'))
      return
    }
    res.json(successResponse(orders))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching order', 'ORDERS_ERROR'))
  }
})

export { router as orderRoute }
