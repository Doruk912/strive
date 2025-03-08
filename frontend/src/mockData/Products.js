export const featuredProducts = [
    {
        id: 1,
        name: 'Basketball',
        description: 'Professional grade basketball',
        price: 29.99,
        category: 'Sports',
        stock: 50,
        status: 'active',
        rating: 4.5,
        image: 'https://i.pinimg.com/550x/13/16/90/1316909d02a22857b697745d07d5d8fa.jpg',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Soccer Ball',
        description: 'FIFA approved soccer ball',
        price: 24.99,
        category: 'Sports',
        stock: 75,
        status: 'active',
        rating: 4.7,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 3,
        name: 'Tennis Racket',
        description: 'Lightweight tennis racket',
        price: 89.99,
        category: 'Sports',
        stock: 30,
        status: 'active',
        rating: 4.3,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 4,
        name: 'Baseball Glove',
        description: 'Leather baseball glove',
        price: 49.99,
        category: 'Sports',
        stock: 45,
        status: 'active',
        rating: 4.6,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 5,
        name: 'Running Shoes',
        description: 'Comfortable running shoes',
        price: 59.99,
        category: 'Fitness',
        stock: 100,
        status: 'active',
        rating: 4.8,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 6,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat',
        price: 19.99,
        category: 'Accessories',
        stock: 150,
        status: 'active',
        rating: 4.4,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];

export const products = [
    {
        id: 1,
        name: 'Basketball',
        description: 'Professional grade basketball',
        price: 29.99,
        category: 'Sports',
        stock: 50,
        status: 'active',
        rating: 4.5,
        image: 'https://i.pinimg.com/550x/13/16/90/1316909d02a22857b697745d07d5d8fa.jpg',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Soccer Ball',
        description: 'FIFA approved soccer ball',
        price: 24.99,
        category: 'Sports',
        stock: 75,
        status: 'active',
        rating: 4.7,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 3,
        name: 'Tennis Racket',
        description: 'Lightweight tennis racket',
        price: 89.99,
        category: 'Sports',
        stock: 30,
        status: 'active',
        rating: 4.3,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 4,
        name: 'Baseball Glove',
        description: 'Leather baseball glove',
        price: 49.99,
        category: 'Sports',
        stock: 45,
        status: 'active',
        rating: 4.6,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 5,
        name: 'Running Shoes',
        description: 'Comfortable running shoes',
        price: 59.99,
        category: 'Fitness',
        stock: 100,
        status: 'active',
        rating: 4.8,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 6,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat',
        price: 19.99,
        category: 'Accessories',
        stock: 150,
        status: 'active',
        rating: 4.4,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];

export const popularCategories = [
    { id: 1, name: 'Jackets', image: 'https://images.ctfassets.net/egcy6g1mdqw1/4eoRpyEp4OT5nwbHXt2XMU/836cd28b6afef9b62cd165a8d693dbb0/Jackets-MensPLP-3.png?fm=avif' },
    { id: 2, name: 'Boots', image: '/api/placeholder/200/200' },
    { id: 3, name: 'Pants', image: '/api/placeholder/200/200' },
    { id: 4, name: 'Innerwear', image: '/api/placeholder/200/200' },
    { id: 5, name: 'Accessories', image: '/api/placeholder/200/200' },
    { id: 6, name: 'Highlights', image: '/api/placeholder/200/200' },
];

export const adminProducts = [
    {
        id: 1,
        name: 'Basketball',
        description: 'Professional grade basketball',
        price: 29.99,
        category: 'Sports',
        sizes: [
            { size: '5', stock: 20 },
            { size: '6', stock: 15 },
            { size: '7', stock: 15 }
        ],
        status: 'active',
        rating: 4.5,
        image: 'https://i.pinimg.com/550x/13/16/90/1316909d02a22857b697745d07d5d8fa.jpg',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Soccer Ball',
        description: 'FIFA approved soccer ball',
        price: 24.99,
        category: 'Sports',
        sizes: [
            { size: '4', stock: 25 },
            { size: '5', stock: 50 }
        ],
        status: 'active',
        rating: 4.7,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 3,
        name: 'Tennis Racket',
        description: 'Lightweight tennis racket',
        price: 89.99,
        category: 'Sports',
        sizes: [
            { size: 'Junior', stock: 10 },
            { size: 'Standard', stock: 20 }
        ],
        status: 'active',
        rating: 4.3,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 4,
        name: 'Baseball Glove',
        description: 'Leather baseball glove',
        price: 49.99,
        category: 'Sports',
        sizes: [
            { size: 'S', stock: 15 },
            { size: 'M', stock: 15 },
            { size: 'L', stock: 15 }
        ],
        status: 'active',
        rating: 4.6,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 5,
        name: 'Running Shoes',
        description: 'Comfortable running shoes',
        price: 59.99,
        category: 'Fitness',
        sizes: [
            { size: '7', stock: 20 },
            { size: '8', stock: 20 },
            { size: '9', stock: 20 },
            { size: '10', stock: 20 },
            { size: '11', stock: 20 }
        ],
        status: 'active',
        rating: 4.8,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 6,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat',
        price: 19.99,
        category: 'Accessories',
        sizes: [
            { size: 'Standard', stock: 150 }
        ],
        status: 'active',
        rating: 4.4,
        image: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];

export const commonSizeSets = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    shoes: ['6', '7', '8', '9', '10', '11', '12'],
    pants: ['28', '30', '32', '34', '36', '38'],
    oneSize: ['Standard'],
    balls: ['4', '5', '6', '7'],
};