const API_URL = '/api/products';
const productTableBody = document.getElementById('productTableBody');
const productForm = document.getElementById('productForm');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));

let barChart, pieChart;
let allProducts = [];

// Initialize Charts
function initCharts() {
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Quantity',
                data: [],
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#fd7e14'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } }
            },
            cutout: '70%'
        }
    });
}

// Update Charts Data
function updateCharts(products) {
    // Bar Chart: Top 5 products by quantity
    const sortedByQty = [...products].sort((a, b) => b.countInStock - a.countInStock).slice(0, 5);
    barChart.data.labels = sortedByQty.map(p => p.name);
    barChart.data.datasets[0].data = sortedByQty.map(p => p.countInStock);
    barChart.update();

    // Pie Chart: Value by category
    const categoryValues = {};
    products.forEach(p => {
        categoryValues[p.category] = (categoryValues[p.category] || 0) + (p.price * p.countInStock);
    });
    
    pieChart.data.labels = Object.keys(categoryValues);
    pieChart.data.datasets[0].data = Object.values(categoryValues);
    pieChart.update();
}

// Update Inventory Insights
function updateInsights(products) {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.countInStock), 0);
    const avgPrice = totalProducts > 0 ? (products.reduce((acc, p) => acc + p.price, 0) / totalProducts) : 0;

    document.getElementById('totalProducts').innerText = totalProducts;
    document.getElementById('totalValue').innerText = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('avgPrice').innerText = `$${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        renderProducts(allProducts);
        updateCharts(allProducts);
        updateInsights(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Render products in the table
function renderProducts(products) {
    productTableBody.innerHTML = '';
    products.forEach((product, index) => {
        const isLowStock = product.countInStock < 5;
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.style.animationDelay = `${index * 0.05}s`;
        if (isLowStock) row.classList.add('table-light');

        row.innerHTML = `
            <td class="ps-4 fw-medium">
                ${product.name}
                ${isLowStock ? '<span class="badge bg-danger ms-2" style="font-size: 0.65rem;">LOW STOCK</span>' : ''}
            </td>
            <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${product.category}</span></td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="${isLowStock ? 'text-danger fw-bold' : ''}">
                    ${product.countInStock}
                </span>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light text-primary me-2" onclick="editProduct('${product._id}')"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-light text-danger" onclick="deleteProduct('${product._id}')"><i class="bi bi-trash"></i></button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// Form handling (Add/Update)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        countInStock: parseInt(document.getElementById('countInStock').value),
        description: document.getElementById('description').value
    };

    try {
        let response;
        if (productId) {
            response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            productModal.hide();
            fetchProducts();
            productForm.reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

function openAddModal() {
    document.getElementById('productModalLabel').innerText = 'Add New Product';
    productForm.reset();
    document.getElementById('productId').value = '';
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const product = await response.json();
        document.getElementById('productModalLabel').innerText = 'Edit Product';
        document.getElementById('productId').value = product._id;
        document.getElementById('name').value = product.name;
        document.getElementById('category').value = product.category;
        document.getElementById('price').value = product.price;
        document.getElementById('countInStock').value = product.countInStock;
        document.getElementById('description').value = product.description || '';
        productModal.show();
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});

// Auto-refresh logic
function startAutoRefresh() {
    let timeLeft = 10;
    const timerElement = document.getElementById('refreshTimer');
    
    setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            fetchProducts();
            timeLeft = 10;
        }
        timerElement.innerText = `Refreshing in ${timeLeft}s`;
    }, 1000);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    fetchProducts();
    startAutoRefresh();
});
