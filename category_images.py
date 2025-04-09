import mysql.connector

# Adjust this with your own MySQL connection info
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123',
    'database': 'strive'
}

# Map image files to category names
image_category_map = {
    "1.jpg": "Men's Jackets",
    "2.jpg": "Men's Footwear",
    "3.jpg": "Outdoor",
    "4.jpg": "Winter Sports",
    "5.jpg": "Camping & Hiking",
    "6.jpg": "Water Sports"
}

# Path to your image folder
image_dir = r'C:\Users\Doruk\OneDrive\Masaüstü\Strive\images'

# Connect to the database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

for filename, category_name in image_category_map.items():
    image_path = f"{image_dir}\\{filename}"

    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Get file type
        file_type = 'image/jpeg' if filename.lower().endswith('.jpg') else 'image/png'

        # Update category
        cursor.execute("""
            UPDATE categories
            SET image_data = %s,
                image_type = %s
            WHERE name = %s
        """, (image_data, file_type, category_name))

        print(f" Updated: {category_name}")

    except Exception as e:
        print(f" Failed to update {category_name}: {e}")

conn.commit()
cursor.close()
conn.close()
