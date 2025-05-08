import mysql.connector
import os
import re
import unicodedata

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

# Function to normalize text (remove accents & convert to lowercase)
def normalize_text(text):
    # Replace Turkish characters with their ASCII equivalents
    replacements = {
        'ı': 'i', 'İ': 'I',
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    }

    for turkish, ascii in replacements.items():
        text = text.replace(turkish, ascii)

    return text.lower()

# Function to find product ID by name pattern
def get_product_id(product_pattern):
    try:
        # Query to find product ID based on name pattern
        cursor.execute("""
            SELECT id, name FROM products
            WHERE name LIKE %s
            LIMIT 1
        """, (f"%{product_pattern}%",))

        result = cursor.fetchone()
        if result:
            return result[0], result[1]
        else:
            return None, None
    except mysql.connector.Error as err:
        print(f"❌ Error finding product ID for '{product_pattern}': {err}")
        return None, None

# Special file mappings for files that don't follow the standard pattern
special_file_mappings = {
    "explorer_tent.jpg": {"product_pattern": "Family Camping Tent - 4 Person", "view": "front"},
    "hiking_backpack.jpg": {"product_pattern": "Lightweight Hiking Backpack", "view": "front"},
    "trail_master_pro_bike.jpg": {"product_pattern": "Trail Master Pro Bike", "view": "front"},
    "tshirt1.jpg": {"product_pattern": "Performance Sport T-Shirt", "view": "front"},
    "tshirt2.jpg": {"product_pattern": "Performance Sport T-Shirt", "view": "side"},
    "tshirt3.jpg": {"product_pattern": "Performance Sport T-Shirt", "view": "back"},
    "Bike_Repair_Kit.jpg": {"product_pattern": "Bike Repair Kit", "view": "front"}
}

# Map product types to database product name patterns
product_type_map = {
    # Original mappings
    "Backpacks kirmizi": "Expedition Trekking Backpack - Ruby Red",
    "Backpacks siyah": "Adventure Trail Backpack - Tactical Black",
    "Basketball Equipment forma": "Professional Basketball Jersey",
    "Basketball Equipment top": "Competition Basketball",
    "Fitness Apparel erkek takim gri": "Men's Performance Training Set - Grey",
    "Fitness Apparel erkek takim siyah": "Men's Elite Workout Set - Black",
    "Fitness Apparel kadin takim kahverengi": "Women's Essential Training Set - Beige",
    "Fitness Apparel kadin takim yesil": "Women's Premium Fitness Set - Sage Green",
    "Golf Equipment canta": "Tour Performance Golf Club Set",
    "Golf Equipment eldiven": "Premium Leather Golf Gloves",
    "Golf Equipment top": "Distance Pro Golf Balls",
    "Gym Equipment Dumbbell 2kg": "Precision Cast Iron Dumbbells - 2kg",
    "Gym Equipment Dumbbell 5kg": "Heavy Duty Cast Iron Dumbbells - 5kg",
    "Gym Equipment Dumbbell 10kg": "Professional Training Dumbbells - 10kg",
    "Gym Equipment Ketibell 5 kg": "Competition Kettlebell Set - 5kg",
    "Gym Equipment Ketibell 8 kg": "Premium Cast Iron Kettlebell - 8kg",
    "Men's Hats": "Performance Outdoor Baseball Cap",
    "Men's Hiking Boots": "TrailMaster Waterproof Hiking Boots",
    "Men's Jackets": "Alpine Explorer Insulated Jacket",
    "Men's Running Shoes": "Momentum Pro Performance Running Shoes",
    "Men's T-Shirts beyaz": "Premium Cotton Crew Neck T-Shirt - White",
    "Men's T-Shirts gri": "Athletic Performance T-Shirt - Heather Grey",
    "Men's Watches": "Expedition Chronograph Sports Watch",
    "Mountain Bikes kirmizi": "Alpine Explorer Mountain Bike - Fire Red",
    "Mountain Bikes yesil": "Trail Blazer Mountain Bike - Forest Green",
    "Road Bikes mavi": "Velocity Pro Road Bike - Electric Blue",
    "Road Bikes siyah": "Endurance Elite Road Bike - Matte Black",
    "Running Gear erkek esoftman takimi mavi": "Performance Athletic Tracksuit - Navy Blue",
    "Running Gear erkek esoftman takimi siyah": "Elite Training Tracksuit - Black",
    "Running Gear kadin esoftman takimi kirmizi": "Active Lifestyle Tracksuit - Ruby Red",
    "Running Gear kadin esoftman takimi pembe": "Essential Training Tracksuit - Beige",
    "Soccer Equipment top": "Match Quality Soccer Ball",
    "Soccer Equipment krampon": "Match Quality Soccer Ball",  # Temporary fallback
    "Swimming Gear bone": "Pro Performance Swim Cap",
    "Swimming Gear erkek mayo": "Competition Men's Swimming Jammers",
    "Swimming Gear gozluk": "Aqua Vision Swimming Goggles",
    "Tennis Equipment raket": "Pro Tour Tennis Racket",
    "Tennis Equipment top": "Championship Tennis Balls",
    "Tents 2 kisilik": "Ultralight 2-Person Backpacking Tent",
    "Tents 4 kisilik": "Family Camping Tent - 4 Person",
    "Women's Bags pembe": "Urban Explorer Crossbody Bag - Pink",
    "Women's Bags siyah": "Weekend Adventure Tote - Black",
    "Women's Dresses lila": "Summer Breeze Floral Dress - Lilac",
    "Women's Dresses pembe": "Weekend Getaway Wrap Dress - Pink",
    "Women's Jewelry": "Urban Explorer Crossbody Bag",  # Temporary fallback
    "Women's Running Shoes": "StrideMax Cushioned Running Shoes",
    "Women's Sandals": "Comfort Plus Ergonomic Sandals",
    "Women's Tops mavi": "Essential Performance Top",
    "Yoga Equipment mat": "Premium Yoga Mat",
    "Yoga Equipment mat 2": "Deluxe Yoga Starter Kit - Lilac",
    "Yoga Equipment mat 3": "Essential Yoga Practice Set - Mint Green",
    "Yoga Equipment pilates bandi": "Professional Pilates Resistance Bands Set"
}

# Add Turkish character variations
turkish_variations = {
    # Add variants with Turkish characters
    "Backpacks kırmızı": "Expedition Trekking Backpack - Ruby Red",
    "Golf Equipment çanta": "Tour Performance Golf Club Set",
    "Swimming Gear gözlük": "Aqua Vision Swimming Goggles",
    "Tents 2 kişilik": "Ultralight 2-Person Backpacking Tent",
    "Tents 4 kişilik": "Family Camping Tent - 4 Person",
    "Yoga Equipment pilates bandı": "Professional Pilates Resistance Bands Set",
    "Mountain Bikes kırmızı": "Alpine Explorer Mountain Bike - Fire Red",
    "Running Gear kadın eşoftman takımı kırmızı": "Active Lifestyle Tracksuit - Ruby Red",
    "Running Gear erkek eşoftman takımı mavi": "Performance Athletic Tracksuit - Navy Blue",
    "Running Gear erkek eşoftman takımı siyah": "Elite Training Tracksuit - Black",
    "Running Gear kadın eşoftman takımı pembe": "Essential Training Tracksuit - Beige"
}

# Merge the dictionaries
product_type_map.update(turkish_variations)

# View type mapping for Turkish terms
view_type_map = {
    "on": "front",
    "arka": "back",
    "yan": "side",
    "ic": "inside",
    "taban": "bottom",
    "ust": "top",
    "ön": "front",
    "iç": "inside",
    "üst": "top"
}

# --- Process all product images ---
print("\nProcessing product images...")

# Get all image files in the directory
image_files = [f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and f not in category_image_map]

successful_imports = 0
failed_imports = 0
processed_files = set()

# First, process special files
for image_file in image_files:
    if image_file in processed_files:
        continue

    if image_file in special_file_mappings:
        image_path = os.path.join(image_dir, image_file)

        # Get special mapping info
        mapping = special_file_mappings[image_file]
        product_pattern = mapping["product_pattern"]
        view_type = mapping["view"]

        # Find the product ID
        product_id, product_name = get_product_id(product_pattern)
        if not product_id:
            print(f"⚠️ No product found matching pattern '{product_pattern}' for special file {image_file}")
            failed_imports += 1
            continue

        # Determine display order
        display_order = 1 if view_type == "front" else 2

        try:
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

            # Insert into product_images table
            cursor.execute("""
                INSERT INTO product_images (product_id, image_data, image_type, display_order)
                VALUES (%s, %s, %s, %s)
            """, (product_id, image_data, image_type, display_order))

            successful_imports += 1
            processed_files.add(image_file)
            print(f"✅ Imported special file {image_file} for product: {product_name} (ID: {product_id}, View: {view_type})")

        except Exception as e:
            print(f"❌ Error importing {image_file}: {e}")
            failed_imports += 1

# Then process regular files
for image_file in image_files:
    if image_file in processed_files:
        continue

    image_path = os.path.join(image_dir, image_file)

    # Extract base name without extension
    base_name = os.path.splitext(image_file)[0]
    normalized_base_name = normalize_text(base_name)

    # Find product type and view
    product_type = None
    view_type = None

    # Match product type from filename
    for product_key in product_type_map.keys():
        normalized_key = normalize_text(product_key)
        if normalized_key in normalized_base_name:
            product_type = product_key
            # The remaining part is likely the view type
            remaining = base_name.replace(product_key, '').strip()
            for view_key, view_value in view_type_map.items():
                if view_key in remaining or normalize_text(view_key) in normalize_text(remaining):
                    view_type = view_value
                    break
            break

    if not product_type:
        print(f"⚠️ Cannot determine product type for {image_file} - skipping")
        failed_imports += 1
        continue

    # Get the product search pattern
    product_pattern = product_type_map.get(product_type)
    if not product_pattern:
        print(f"⚠️ No product pattern defined for {product_type} - skipping {image_file}")
        failed_imports += 1
        continue

    # Find the product ID
    product_id, product_name = get_product_id(product_pattern)
    if not product_id:
        print(f"⚠️ No product found matching pattern '{product_pattern}' for image {image_file}")
        failed_imports += 1
        continue

    # Determine display order (front views first, then others)
    display_order = 1 if view_type == "front" else 2

    try:
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

        # Insert into product_images table
        cursor.execute("""
            INSERT INTO product_images (product_id, image_data, image_type, display_order)
            VALUES (%s, %s, %s, %s)
        """, (product_id, image_data, image_type, display_order))

        successful_imports += 1
        processed_files.add(image_file)
        print(f"✅ Imported image {image_file} for product: {product_name} (ID: {product_id}, View: {view_type})")

    except Exception as e:
        print(f"❌ Error importing {image_file}: {e}")
        failed_imports += 1

# Commit changes
try:
    conn.commit()
    print(f"\n✅ Successfully imported {successful_imports} images")
    if failed_imports > 0:
        print(f"⚠️ Failed to import {failed_imports} images")
except mysql.connector.Error as err:
    print(f"\n❌ Failed to commit changes: {err}")
finally:
    if 'cursor' in locals():
        cursor.close()