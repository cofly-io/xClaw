# -*- coding: utf-8 -*-
"""从 PNG 生成 xClaw 图标（四角圆角透明）"""
from PIL import Image, ImageDraw
import os

PNG_PATH = os.path.join(os.path.dirname(__file__), "1774599501.png")
ICO_PATH = os.path.join(os.path.dirname(__file__), "icon.ico")

# 图标尺寸
SIZES = [256, 128, 64, 48, 32, 16]
# 圆角半径比例（数值越小角越圆）
CORNER_RADIUS_RATIO = 0.15  # 占图标尺寸的比例

def round_corner(img, size, radius_ratio):
    """将图片四角裁剪为圆角"""
    # 创建圆形蒙版
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)

    radius = int(size * radius_ratio)

    # 画圆角矩形（四个角）
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)

    # 应用蒙版
    result = img.copy()
    result.putalpha(mask)
    return result

def create_icon():
    # 打开原图
    img = Image.open(PNG_PATH)
    print(f"原图尺寸: {img.size}, 模式: {img.mode}")

    # 裁剪为正方形（从中心裁剪）
    width, height = img.size
    crop_size = min(width, height)
    left = (width - crop_size) // 2
    top = (height - crop_size) // 2
    right = left + crop_size
    bottom = top + crop_size
    img = img.crop((left, top, right, bottom))

    # 转换为 RGBA
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    print(f"裁剪后尺寸: {img.size}")

    # 生成不同尺寸
    images = []
    for size in SIZES:
        # 缩放
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        # 圆角裁剪
        rounded = round_corner(resized, size, CORNER_RADIUS_RATIO)
        images.append(rounded)
        print(f"  生成 {size}x{size} 圆角")

    # 保存为 ICO
    images[0].save(
        ICO_PATH,
        format="ICO",
        sizes=[(s, s) for s in SIZES],
        quality=95
    )
    print(f"图标已生成: {ICO_PATH}")

if __name__ == "__main__":
    create_icon()
