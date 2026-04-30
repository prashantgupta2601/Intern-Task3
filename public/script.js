const API_URL = 'http://localhost:5000/api/products';
const productTableBody = document.getElementById('productTableBody');
const productForm = document.getElementById('productForm');

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Render products in the table
function renderProducts(products) {
    productTableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.countInStock}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editProduct('${product._id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

function openAddModal() {
    document.getElementById('productModalLabel').innerText = 'Add New Product';
    productForm.reset();
    document.getElementById('productId').value = '';
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchProducts);
