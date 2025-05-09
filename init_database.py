import os
import mysql.connector
import re

# --- Get the directory where the script is located ---
script_dir = os.path.dirname(os.path.abspath(__file__))

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123',
    'database': 'strive'
}

image_dir = os.path.join(script_dir, 'images')

# Map image files to category names
category_image_map = {
    "1.jpg": "Men's Jackets",
    "2.jpg": "Men's Footwear",
    "3.jpg": "Outdoor",
    "4.jpg": "Winter Sports",
    "5.jpg": "Camping & Hiking",
    "6.jpg": "Water Sports"
}

# Connect to the database
try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    print("✅ Connected to database successfully")
except mysql.connector.Error as err:
    print(f"❌ Failed to connect to database: {err}")
    exit(1)

# --- Process category images ---
print("\nProcessing category images...")
for filename, category_name in category_image_map.items():
    image_path = os.path.join(image_dir, filename)

    try:
        # Check if the image file actually exists
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path} - Skipping category: {category_name}")
            continue

        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine image type
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext in ['.jpg', '.jpeg']:
            image_type = 'image/jpeg'
        elif file_ext == '.png':
            image_type = 'image/png'
        else:
            image_type = 'application/octet-stream'

        # Update the category with image
        cursor.execute("""
            UPDATE categories
            SET image_data = %s,
                image_type = %s
            WHERE name = %s
        """, (image_data, image_type, category_name))

        if cursor.rowcount > 0:
            print(f"✅ Updated category: {category_name}")
        else:
            print(f"⚠️ Category '{category_name}' not found in database.")

    except Exception as e:
        print(f"❌ Failed to update {category_name}: {e}")

# --- Process product images ---
print("\nProcessing product images...")

# Pattern to match product image files: product_ID_VIEW.jpg
product_image_pattern = re.compile(r'product_(\d+)_(\d+)\.(jpg|jpeg|png)$', re.IGNORECASE)

successful_imports = 0
failed_imports = 0

# Get all image files in the directory
image_files = [f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and f not in category_image_map]

for image_file in image_files:
    # Skip category images
    if image_file in category_image_map:
        continue

    # Match the filename to our pattern
    match = product_image_pattern.match(image_file)
    if not match:
        print(f"⚠️ Skipping file that doesn't match naming pattern: {image_file}")
        continue

    product_id = int(match.group(1))
    display_order = int(match.group(2))

    image_path = os.path.join(image_dir, image_file)

    try:
        # First check if the product exists
        cursor.execute("SELECT name FROM products WHERE id = %s", (product_id,))
        product_result = cursor.fetchone()

        if not product_result:
            print(f"❌ Product ID {product_id} not found in database - skipping {image_file}")
            failed_imports += 1
            continue

        product_name = product_result[0]

        # Read the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine image type
        file_ext = os.path.splitext(image_file)[1].lower()
        if file_ext in ['.jpg', '.jpeg']:
            image_type = 'image/jpeg'
        elif file_ext == '.png':
            image_type = 'image/png'
        else:
            image_type = 'application/octet-stream'

        # Delete any existing images for this product with this display order
        cursor.execute("""
            DELETE FROM product_images
            WHERE product_id = %s AND display_order = %s
        """, (product_id, display_order))

        # Insert into product_images table
        cursor.execute("""
            INSERT INTO product_images (product_id, image_data, image_type, display_order)
            VALUES (%s, %s, %s, %s)
        """, (product_id, image_data, image_type, display_order))

        successful_imports += 1
        print(f"✅ Imported image {image_file} for {product_name} (ID: {product_id}, Order: {display_order})")

    except Exception as e:
        print(f"❌ Error importing {image_file}: {e}")
        failed_imports += 1

# Commit changes
try:
    conn.commit()
    print(f"\n✅ Successfully imported {successful_imports} product images")
    if failed_imports > 0:
        print(f"⚠️ Failed to import {failed_imports} images")
except mysql.connector.Error as err:
    print(f"\n❌ Failed to commit changes: {err}")
finally:
    if 'cursor' in locals() and cursor is not None:
        cursor.close()
    if 'conn' in locals() and conn is not None and conn.is_connected():
        conn.close()
    print("Database connection closed.")

print("Script execution finished.")