import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getOrders, updateOrder, confirmOrder } from '../services/order.js'
import { validate } from '../middlewares/validate.js'
import { updateOrderSchema } from '../types/order.types.js'

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

router.patch('/:id', validate(updateOrderSchema), async (req, res) => {
  try {
    const order = await updateOrder(req.params.id, req.body)
    if (!order) {
      res.status(404).json(errorResponse('Order not found', 'ORDER_NOT_FOUND'))
    }
    res.status(200).json(successResponse(order))
  } catch (error) {
    res.status(500).json(errorResponse('Error updating order', 'ORDERS_ERROR'))
  }
})

router.put('/confirm/:id', async (req, res) => {
  try {
    const order = await confirmOrder(req.params.id, req.body)
  } catch (error) {
    res.status(500).json(errorResponse('Error confirming order', 'ORDERS_ERROR'))
  }
})
export { router as orderRoute }
