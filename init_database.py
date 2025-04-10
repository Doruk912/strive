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
image_category_map = {
    "1.jpg": "Men's Jackets",
    "2.jpg": "Men's Footwear",
    "3.jpg": "Outdoor",
    "4.jpg": "Winter Sports",
    "5.jpg": "Camping & Hiking",
    "6.jpg": "Water Sports"
}

# Connect to the database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# --- STEP 1: Run SQL file ---
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
for filename, category_name in image_category_map.items():
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

        print(f"✅ Updated: {category_name}")

    except FileNotFoundError:
        print(f"❌ Image not found: {image_path}")
    except Exception as e:
        print(f"❌ Failed to update {category_name}: {e}")

# Finalize
conn.commit()
cursor.close()
conn.close()
print("✅ Done!")
