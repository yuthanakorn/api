import { Elysia, t } from 'elysia'
import { PrismaClient } from '@prisma/client'

import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'

const prisma = new PrismaClient()

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: 'public', prefix: '' }))
  .get('/', () => Bun.file(`${import.meta.dir}/public/index.html`))
  .onError(({ error, code }) => {
    console.error(code, error)
    return { error: 'message' in error ? error.message : error }
  })
  
  // Lab 1: ดึงข้อมูลสินค้าคงคลัง (Read / GET)
  .get('/inventory', async ({ query }) => {
    const lowStock = query.low_stock === 'true'
    
    return await prisma.product.findMany({
      where: lowStock ? {
        quantity: {
          lte: 10
        }
      } : {},
      orderBy: {
        name: 'asc'
      }
    })
  }, {
    query: t.Object({
      low_stock: t.Optional(t.String())
    })
  })

  // Lab 2: รับเข้าสินค้าใหม่ (Create / POST)
  .post('/inventory', async ({ body }) => {
    return await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        zone: body.zone,
        quantity: body.quantity ?? 0
      }
    })
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      sku: t.String({ minLength: 1 }),
      zone: t.String({ minLength: 1 }),
      quantity: t.Optional(t.Numeric({ default: 0 }))
    })
  })

  // Lab 3: อัปเดตจำนวนสต็อก (Update / PATCH)
  .patch('/inventory/:id/adjust', async ({ params: { id }, body, set }) => {
    console.log('Adjusting stock for ID:', id)
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })

      if (!product) {
        set.status = 404
        return { message: 'ไม่พบสินค้า' }
      }

      const newQuantity = product.quantity + body.change

      return await prisma.product.update({
        where: { id },
        data: {
          quantity: newQuantity
        }
      })
    } catch (error) {
      set.status = 500
      return { message: 'เกิดข้อผิดพลาดในการอัปเดตสต็อก' }
    }
  }, {
    body: t.Object({
      change: t.Numeric()
    })
  })

  // Lab 4: ลบรายการสินค้าที่ยกเลิกการจำหน่าย (Delete / DELETE)
  .delete('/inventory/:id', async ({ params: { id }, set }) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })

      if (!product) {
        set.status = 404
        return { message: 'ไม่พบสินค้า' }
      }

      if (product.quantity > 0) {
        set.status = 400
        return { message: 'ไม่สามารถลบสินค้าที่ยังมีอยู่ในสต็อกได้' }
      }

      await prisma.product.delete({
        where: { id }
      })

      return { message: 'ลบสินค้าสำเร็จ' }
    } catch (error) {
      set.status = 500
      return { message: 'เกิดข้อผิดพลาดในการลบสินค้า' }
    }
  })

  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)