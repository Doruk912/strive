export const popularCategories = [
    {
        id: 1,
        name: 'Jackets',
        image: 'https://images.ctfassets.net/egcy6g1mdqw1/4eoRpyEp4OT5nwbHXt2XMU/836cd28b6afef9b62cd165a8d693dbb0/Jackets-MensPLP-3.png?fm=avif',
        subcategories: [
            { id: 101, name: 'Winter Jackets', parentId: 1 },
            { id: 102, name: 'Rain Jackets', parentId: 1 },
            { id: 103, name: 'Windbreakers', parentId: 1 },
            { id: 104, name: 'Bomber Jackets', parentId: 1 }
        ]
    },
    {
        id: 2,
        name: 'Boots',
        image: 'https://obozfootwear-prod.zaneray.com/cms/images/c5b8873e-6a9e-4bcf-9624-3a32866dec63_Bridger-insulated-2.jpg?auto=compress,format&rect=186,0,820,1178&w=585&h=840',
        subcategories: [
            { id: 201, name: 'Hiking Boots', parentId: 2 },
            { id: 202, name: 'Winter Boots', parentId: 2 },
            { id: 203, name: 'Casual Boots', parentId: 2 }
        ]
    },
    {
        id: 3,
        name: 'Pants',
        image: '/api/placeholder/200/200',
        subcategories: [
            { id: 301, name: 'Cargo Pants', parentId: 3 },
            { id: 302, name: 'Hiking Pants', parentId: 3 },
            { id: 303, name: 'Track Pants', parentId: 3 },
            { id: 304, name: 'Thermal Pants', parentId: 3 }
        ]
    },
    {
        id: 4,
        name: 'Fleece',
        image: '/api/placeholder/200/200',
        subcategories: [
            { id: 401, name: 'Full-Zip Fleece', parentId: 4 },
            { id: 402, name: 'Half-Zip Fleece', parentId: 4 },
            { id: 403, name: 'Fleece Vests', parentId: 4 }
        ]
    },
    {
        id: 5,
        name: 'Innerwear',
        image: '/api/placeholder/200/200',
        subcategories: [
            { id: 501, name: 'Base Layers', parentId: 5 },
            { id: 502, name: 'Sports Underwear', parentId: 5 },
            { id: 503, name: 'Compression Wear', parentId: 5 }
        ]
    },
    {
        id: 6,
        name: 'Thermals',
        image: '/api/placeholder/200/200',
        subcategories: [
            { id: 601, name: 'Thermal Tops', parentId: 6 },
            { id: 602, name: 'Thermal Bottoms', parentId: 6 },
            { id: 603, name: 'Thermal Sets', parentId: 6 }
        ]
    }
];

// Helper function to get all subcategories
export const getAllSubcategories = () => {
    return popularCategories.reduce((acc, category) => {
        return [...acc, ...category.subcategories];
    }, []);
};

// Helper function to get subcategories by parent ID
export const getSubcategoriesByParent = (parentId) => {
    const category = popularCategories.find(cat => cat.id === parentId);
    return category ? category.subcategories : [];
};

// Helper function to get category by ID
export const getCategoryById = (categoryId) => {
    return popularCategories.find(cat => cat.id === categoryId);
};

// Helper function to get subcategory by ID
export const getSubcategoryById = (subcategoryId) => {
    const allSubcategories = getAllSubcategories();
    return allSubcategories.find(sub => sub.id === subcategoryId);
};

// Helper function to get full category path (for breadcrumbs, etc.)
export const getCategoryPath = (subcategoryId) => {
    const subcategory = getSubcategoryById(subcategoryId);
    if (!subcategory) return null;

    const category = getCategoryById(subcategory.parentId);
    return {
        category,
        subcategory
    };
};

export const CATEGORY_TYPES = {
    MAIN: 'main',
    SUB: 'sub'
};

export const CATEGORY_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived'
};