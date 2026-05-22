const fs = require('fs');
const path = require('path');

let productsConfig = null;

function loadProducts() {
  if (productsConfig) return productsConfig;
  const data = fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf-8');
  productsConfig = JSON.parse(data);
  return productsConfig;
}

function getProductsByCategory() {
  const config = loadProducts();
  return config.categories;
}

function getProductById(id) {
  const config = loadProducts();
  for (const cat of config.categories) {
    for (const p of cat.products) {
      if (p.id === id) return p;
    }
  }
  return null;
}

function getDependency(name) {
  const config = loadProducts();
  return config.dependencies[name] || null;
}

function getRequiredDependencies(productIds) {
  const deps = new Set();
  for (const id of productIds) {
    const product = getProductById(id);
    if (product && product.requires) {
      product.requires.forEach(d => deps.add(d));
    }
  }
  return Array.from(deps);
}

module.exports = { loadProducts, getProductsByCategory, getProductById, getDependency, getRequiredDependencies };
