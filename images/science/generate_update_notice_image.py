from PIL import Image, ImageDraw, ImageFont

# Text to render
header = "Update as on May 11, 2020"
body = "We regret to announce that due to COVID-19 pandemic situation we are canceling the Chasing Eclipse expedition."

# Image settings
width, height = 1100, 220
bg_color = (255, 255, 255)
header_color = (200, 0, 0)
body_color = (200, 0, 0)

# Create image
img = Image.new('RGB', (width, height), color=bg_color)
draw = ImageDraw.Draw(img)

# Load fonts (use a default font if arial.ttf is not available)
try:
    header_font = ImageFont.truetype("arial.ttf", 40)
    body_font = ImageFont.truetype("arial.ttf", 32)
except:
    header_font = ImageFont.load_default()
    body_font = ImageFont.load_default()

# Draw text
header_y = 30
body_y = 100
draw.text((40, header_y), header, fill=header_color, font=header_font)
draw.text((40, body_y), body, fill=body_color, font=body_font)

# Save image to assets/images/science/
img.save("assets/images/science/update_covid_notice.png")
