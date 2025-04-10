import mysql.connector
import os

# Adjust this with your own MySQL connection info
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123',
    'database': 'strive'
}

# Path to your SQL schema file
sql_file_path = r'C:\Users\Doruk\OneDrive\Masaüstü\Strive\schema.sql'

# Path to your image folder
image_dir = r'C:\Users\Doruk\OneDrive\Masaüstü\Strive\images'

# Map image files to category names
category_image_map = {
    "1.jpg": "Men's Jackets",
    "2.jpg": "Men's Footwear",
    "3.jpg": "Outdoor",
    "4.jpg": "Winter Sports",
    "5.jpg": "Camping & Hiking",
    "6.jpg": "Water Sports"
}

# Map image files to product IDs with display order
product_image_map = {
    "trail_master_pro_bike.jpg": {"id": 28, "order": 1},    # Trail Master Pro Bike
    "bike_repair_kit.jpg": {"id": 30, "order": 1},          # Bike Repair Kit
    "tshirt1.jpg": {"id": 2, "order": 1},                   # Performance T-Shirt - First image
    "tshirt2.jpg": {"id": 2, "order": 2},                   # Performance T-Shirt - Second image
    "tshirt3.jpg": {"id": 2, "order": 3},                   # Performance T-Shirt - Third image
    "explorer_tent.jpg": {"id": 16, "order": 1},            # Explorer 4-Person Tent
    "hiking_backpack.jpg": {"id": 17, "order": 1}           # Lightweight Hiking Backpack
}

# Connect to the database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# --- STEP 1: Run SQL file ---
print("Step 1: Executing SQL Schema...")
try:
    with open(sql_file_path, 'r', encoding='utf-8') as file:
        sql_commands = file.read()

    # Split by semicolon and run each command
    for command in sql_commands.split(';'):
        command = command.strip()
        if command:
            try:
                cursor.execute(command)
            except Exception as e:
                print(f"Failed to execute command:\n{command}\nError: {e}")

    print("✅ SQL schema executed successfully.")

except FileNotFoundError:
    print(f"❌ SQL file not found at: {sql_file_path}")
except Exception as e:
    print(f"❌ Error while executing SQL schema: {e}")

# --- STEP 2: Insert category images ---
print("\nStep 2: Adding category images...")
for filename, category_name in category_image_map.items():
    image_path = os.path.join(image_dir, filename)

    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine MIME type
        file_type = 'image/jpeg' if filename.lower().endswith('.jpg') else 'image/png'

        # Update the category with image
        cursor.execute("""
            UPDATE categories
            SET image_data = %s,
                image_type = %s
            WHERE name = %s
        """, (image_data, file_type, category_name))

        print(f"✅ Updated category: {category_name}")

    except FileNotFoundError:
        print(f"❌ Image not found: {image_path}")
    except Exception as e:
        print(f"❌ Failed to update {category_name}: {e}")

# --- STEP 3: Insert product images ---
print("\nStep 3: Adding product images...")
for filename, product_info in product_image_map.items():
    image_path = os.path.join(image_dir, filename)

    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine MIME type
        file_type = 'image/jpeg' if filename.lower().endswith('.jpg') else 'image/png'

        # Insert the image into product_images table
        cursor.execute("""
            INSERT INTO product_images (product_id, image_data, image_type, display_order)
            VALUES (%s, %s, %s, %s)
        """, (product_info['id'], image_data, file_type, product_info['order']))

        print(f"✅ Added image for product ID: {product_info['id']} (Order: {product_info['order']})")

    except FileNotFoundError:
        print(f"❌ Image not found: {image_path}")
    except Exception as e:
        print(f"❌ Failed to add image for product ID {product_info['id']}: {e}")

# Finalize
conn.commit()
cursor.close()
conn.close()
print("\n✅ All operations completed successfully!")