import os
from PIL import Image

def crop_transparency(img):
    """
    Crop the transparent areas of an image.

    Parameters:
    - img (PIL.Image.Image): The image to process.

    Returns:
    - PIL.Image.Image: The cropped image with no transparent borders.
    """
    # Only process if image has transparency (mode is RGBA)
    if img.mode == 'RGBA':
        # Get the alpha channel
        alpha = img.split()[3]
        # Create a mask of the non-transparent areas
        mask = alpha.point(lambda p: p > 0)
        # Get the bounding box of the non-transparent area
        bbox = mask.getbbox()
        if bbox:
            return img.crop(bbox)
    return img

def process_images(directory):
    """
    Process all PNG images in the specified directory to crop transparency.

    Parameters:
    - directory (str): The path to the directory containing PNG images.
    """
    for filename in os.listdir(directory):
        if filename.endswith('.png'):
            filepath = os.path.join(directory, filename)
            with Image.open(filepath) as img:
                cropped_img = crop_transparency(img)
                # Save the processed image, replacing the original file
                cropped_img.save(filepath)

# Specify the directory containing the PNG files
directory_path = '/Users/hogyzen12/coding-project-folders/card-crush-web/web/src/assets'

# Process the images
process_images(directory_path)