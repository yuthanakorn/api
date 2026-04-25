const BASE_URL = 'http://localhost:3000'

async function runTests() {
  console.log('--- Starting Tests ---')

  const suffix = Date.now().toString().slice(-4)
  // 1. Create Product (Lab 2)
  console.log('\n[POST /inventory] Creating products...')
  const p1 = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Apple', sku: 'A' + suffix, zone: 'A1', quantity: 5 })
  }).then(r => r.json())
  console.log('Product 1:', p1)

  const p2 = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Banana', sku: 'B' + suffix, zone: 'B2', quantity: 20 })
  }).then(r => r.json())
  console.log('Product 2:', p2)

  // 2. Get All Products (Lab 1)
  console.log('\n[GET /inventory] Fetching all...')
  const all = await fetch(`${BASE_URL}/inventory`).then(r => r.json())
  console.log('All products (sorted):', all)

  // 3. Get Low Stock (Lab 1 Challenge)
  console.log('\n[GET /inventory?low_stock=true] Fetching low stock...')
  const low = await fetch(`${BASE_URL}/inventory?low_stock=true`).then(r => r.json())
  console.log('Low stock products:', low)

  // 4. Adjust Stock (Lab 3)
  console.log('\n[PATCH /inventory/:id/adjust] Adding stock to Apple (+10)...')
  const adjusted = await fetch(`${BASE_URL}/inventory/${p1.id}/adjust`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ change: 10 })
  }).then(r => r.json())
  console.log('Adjusted Product 1:', adjusted)

  // 5. Delete (Lab 4)
  console.log('\n[DELETE /inventory/:id] Trying to delete Apple (quantity > 0)...')
  const delFail = await fetch(`${BASE_URL}/inventory/${p1.id}`, { method: 'DELETE' })
  console.log('Status:', delFail.status, 'Body:', await delFail.json())

  console.log('\n[PATCH /inventory/:id/adjust] Reducing stock to 0 for Apple...')
  await fetch(`${BASE_URL}/inventory/${p1.id}/adjust`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ change: -15 })
  })

  console.log('[DELETE /inventory/:id] Deleting Apple (quantity = 0)...')
  const delSuccess = await fetch(`${BASE_URL}/inventory/${p1.id}`, { method: 'DELETE' })
  console.log('Status:', delSuccess.status, 'Body:', await delSuccess.json())

  console.log('\n--- Tests Complete ---')
}

runTests().catch(console.error)
