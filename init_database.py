import mysql.connector
import os

# --- Get the directory where the script is located ---
script_dir = os.path.dirname(os.path.abspath(__file__))

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123',
    'database': 'strive'
}

sql_file_path = os.path.join(script_dir, 'schema.sql')

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
try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
except mysql.connector.Error as err:
    print(f"❌ Failed to connect to database: {err}")
    exit(1) # Exit if database connection fails


# --- STEP 1: Run SQL file ---
print("Step 1: Executing SQL Schema...")
try:
    with open(sql_file_path, 'r', encoding='utf-8') as file:
        sql_commands = file.read()

    # Split by semicolon and run each command
    # Be cautious: This simple split might fail with semicolons inside comments or strings.
    # A more robust parser might be needed for complex SQL.
    for command in sql_commands.split(';'):
        command = command.strip()
        if command:
            try:
                # Handle potential issues with multi-line commands if split by ';' is too simple
                cursor.execute(command)
            except mysql.connector.Error as e:
                print(f"⚠️ Warning: Failed to execute command:\n{command.splitlines()[0]}...\nError: {e}") # Print only first line of command

    print("✅ SQL schema execution finished.")

except FileNotFoundError:
    print(f"❌ SQL file not found at: {sql_file_path}")
except Exception as e:
    print(f"❌ Error while reading or executing SQL schema: {e}")


# --- STEP 2: Insert category images ---
print("\nStep 2: Adding category images...")
for filename, category_name in category_image_map.items():
    image_path = os.path.join(image_dir, filename) # image_dir is now relative

    try:
        # Check if the image file actually exists before trying to open it
        if not os.path.exists(image_path):
             print(f"❌ Image not found: {image_path} - Skipping category: {category_name}")
             continue # Skip to the next image

        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine MIME type (basic check)
        file_ext = filename.lower().split('.')[-1]
        if file_ext == 'jpg' or file_ext == 'jpeg':
            file_type = 'image/jpeg'
        elif file_ext == 'png':
            file_type = 'image/png'
        else:
            file_type = 'application/octet-stream' # Default for unknown types
            print(f"⚠️ Warning: Unknown image type for {filename}, using {file_type}")


        # Update the category with image
        cursor.execute("""
            UPDATE categories
            SET image_data = %s,
                image_type = %s
            WHERE name = %s
        """, (image_data, file_type, category_name))

        # Check if a row was actually updated
        if cursor.rowcount > 0:
             print(f"✅ Updated category: {category_name}")
        else:
             print(f"⚠️ Warning: Category '{category_name}' not found in database.")


    except Exception as e:
        print(f"❌ Failed to update {category_name}: {e}")


# --- STEP 3: Insert product images ---
print("\nStep 3: Adding product images...")
for filename, product_info in product_image_map.items():
    image_path = os.path.join(image_dir, filename) # image_dir is now relative

    try:
        # Check if the image file actually exists before trying to open it
        if not os.path.exists(image_path):
             print(f"❌ Image not found: {image_path} - Skipping product ID: {product_info['id']}")
             continue # Skip to the next image

        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Determine MIME type (basic check)
        file_ext = filename.lower().split('.')[-1]
        if file_ext == 'jpg' or file_ext == 'jpeg':
            file_type = 'image/jpeg'
        elif file_ext == 'png':
            file_type = 'image/png'
        else:
            file_type = 'application/octet-stream' # Default for unknown types
            print(f"⚠️ Warning: Unknown image type for {filename}, using {file_type}")

        # Insert the image into product_images table
        cursor.execute("""
            INSERT INTO product_images (product_id, image_data, image_type, display_order)
            VALUES (%s, %s, %s, %s)
        """, (product_info['id'], image_data, file_type, product_info['order']))

        print(f"✅ Added image for product ID: {product_info['id']} (Order: {product_info['order']})")

    except Exception as e:
        print(f"❌ Failed to add image for product ID {product_info['id']}: {e}")

# Finalize
try:
    conn.commit()
    print("\n✅ Database changes committed.")
except mysql.connector.Error as err:
    print(f"\n❌ Failed to commit changes: {err}")
finally:
    if 'cursor' in locals() and cursor is not None:
        cursor.close()
    if 'conn' in locals() and conn is not None and conn.is_connected():
        conn.close()
    print("Database connection closed.")

print("Script execution finished.")