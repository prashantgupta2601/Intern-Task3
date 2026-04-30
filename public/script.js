const API_URL = '/api/products';
const productTableBody = document.getElementById('productTableBody');
const productForm = document.getElementById('productForm');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));

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

// Add or Update product
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
            // Update
            response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Create
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

// Edit product (pre-fill form)
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

// Delete product
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchProducts();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchProducts);
