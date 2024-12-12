const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    try {
        fs.mkdirSync(imagesDir, { recursive: true });
    } catch (error) {
        console.error('Error creating images directory:', error);
    }
}

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(imagesDir));

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const productsPath = path.join(__dirname, 'products.json');
        if (!fs.existsSync(productsPath)) {
            fs.writeFileSync(productsPath, '[]', 'utf8');
        }
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        res.json(products);
    } catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ error: 'Error reading products' });
    }
});

// Add product endpoint
app.post('/api/add-product', upload.array('images', 5), (req, res) => {
    try {
        // Validate required fields
        const { name, price, description, category } = req.body;
        
        if (!name || !price || !description || !category) {
            return res.status(400).json({ 
                error: 'Missing required fields. Please provide name, price, description, and category.' 
            });
        }

        // Validate price is a number
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ 
                error: 'Price must be a valid positive number.' 
            });
        }

        // Parse sizes and colors
        let sizes = [];
        let colors = [];
        try {
            sizes = JSON.parse(req.body.sizes || '[]');
            colors = JSON.parse(req.body.colors || '[]');
        } catch (e) {
            return res.status(400).json({ 
                error: 'Invalid format for sizes or colors.' 
            });
        }

        // Get image paths
        const imagePaths = req.files ? req.files.map(file => '/images/' + file.filename) : [];

        const newProduct = {
            id: Date.now().toString(), // Add unique ID
            name: name.trim(),
            price: numPrice,
            description: description.trim(),
            category: category.trim(),
            sizes,
            colors,
            images: imagePaths,
            dateAdded: new Date().toISOString()
        };

        // Read existing products
        const productsPath = path.join(__dirname, 'products.json');
        let products = [];
        if (fs.existsSync(productsPath)) {
            const fileContent = fs.readFileSync(productsPath, 'utf8');
            products = fileContent ? JSON.parse(fileContent) : [];
        }

        // Add new product
        products.push(newProduct);

        // Save updated products
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');

        res.json({ 
            message: 'Product added successfully', 
            product: newProduct 
        });
    } catch (error) {
        console.error('Error adding product:', error);
        // Clean up uploaded files if there was an error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (e) {
                    console.error('Error cleaning up file:', e);
                }
            });
        }
        res.status(500).json({ 
            error: 'Error adding product. Please try again.' 
        });
    }
});

// Delete product endpoint
app.delete('/api/products/:index', (req, res) => {
    try {
        const productsPath = path.join(__dirname, 'products.json');
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (index >= 0 && index < products.length) {
            // Delete associated images
            const deletedProduct = products[index];
            if (deletedProduct.images) {
                deletedProduct.images.forEach(imagePath => {
                    const fullPath = path.join(__dirname, imagePath);
                    if (fs.existsSync(fullPath)) {
                        try {
                            fs.unlinkSync(fullPath);
                        } catch (e) {
                            console.error('Error deleting image:', e);
                        }
                    }
                });
            }
            
            products.splice(index, 1);
            fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
