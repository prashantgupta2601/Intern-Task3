// script.js - Placeholder for product dashboard functionality

function openAddModal() {
    document.getElementById('productModalLabel').innerText = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

// Initial structure setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');
});
