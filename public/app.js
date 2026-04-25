const API_URL = '/inventory';

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchProducts();
    setupEventListeners();
});

function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('th-TH', options);
}

let allProducts = [];
let currentFilter = 'all';

async function fetchProducts() {
    const list = document.getElementById('product-list');
    try {
        const url = currentFilter === 'low' ? `${API_URL}?low_stock=true` : API_URL;
        const res = await fetch(url);
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        list.innerHTML = '<div class="loading">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
    }
}

function renderProducts(products) {
    const list = document.getElementById('product-list');
    if (products.length === 0) {
        list.innerHTML = '<div class="loading">ไม่มีสินค้า</div>';
        return;
    }

    list.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p><span class="badge">${p.sku}</span>โซน ${p.zone}</p>
                <button class="delete-btn" onclick="deleteProduct('${p.id}')">ลบรายการ</button>
            </div>
            <div class="stock-control">
                <button class="adjust-btn" onclick="adjustStock('${p.id}', -1)">-</button>
                <div class="qty-display ${p.quantity <= 10 ? 'low' : ''}">${p.quantity}</div>
                <button class="adjust-btn" onclick="adjustStock('${p.id}', 1)">+</button>
            </div>
        </div>
    `).join('');
}

async function adjustStock(id, change) {
    try {
        const res = await fetch(`${API_URL}/${id}/adjust`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ change })
        });
        
        if (res.ok) {
            fetchProducts();
        } else {
            const data = await res.json();
            alert(data.message || 'ไม่สามารถปรับสต็อกได้');
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาด');
    }
}

async function deleteProduct(id) {
    if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (res.ok) {
            fetchProducts();
        } else {
            alert(data.message || 'ไม่สามารถลบได้');
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาด');
    }
}

function setupEventListeners() {
    // Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            fetchProducts();
        });
    });

    // Modal
    const modal = document.getElementById('modal');
    document.getElementById('add-btn').onclick = () => modal.classList.add('active');
    document.getElementById('close-modal').onclick = () => modal.classList.remove('active');

    // Form Submit
    document.getElementById('product-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            zone: formData.get('zone'),
            quantity: parseInt(formData.get('quantity')) || 0
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                e.target.reset();
                modal.classList.remove('active');
                fetchProducts();
            } else {
                const errData = await res.json();
                alert(errData.message || 'ไม่สามารถเพิ่มสินค้าได้');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาด');
        }
    };
}
