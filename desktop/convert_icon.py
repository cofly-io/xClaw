# -*- coding: utf-8 -*-
"""纯 Python 生成 ICO 文件（无第三方依赖）

从 SVG 的 path 数据生成一个简单的蓝色 X 图标。
"""
import struct
import os
import zlib


def create_rgba_image(size: int) -> bytes:
    """生成蓝色 X 图标的 RGBA 像素数据"""
    pixels = bytearray(size * size * 4)
    color = (0x18, 0x64, 0xFF, 0xFF)  # #1864FF
    bg = (255, 255, 255, 0)  # 透明背景

    # 线条粗度按比例
    thickness = max(size // 8, 2)

    for y in range(size):
        for x in range(size):
            offset = (y * size + x) * 4

            # 画 X：两条对角线
            # 左上到右下
            diag1 = abs(x - y) < thickness
            # 右上到左下
            diag2 = abs(x - (size - 1 - y)) < thickness

            # 留边距
            margin = size // 8
            in_bounds = margin <= x < size - margin and margin <= y < size - margin

            if in_bounds and (diag1 or diag2):
                pixels[offset:offset + 4] = bytes(color)
            else:
                pixels[offset:offset + 4] = bytes(bg)

    return bytes(pixels)


def create_png(width: int, height: int, rgba_data: bytes) -> bytes:
    """从 RGBA 数据创建 PNG 文件"""

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        c = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + c + crc

    # PNG signature
    sig = b"\x89PNG\r\n\x1a\n"

    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)

    # IDAT - raw pixel data with filter byte
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: None
        row_start = y * width * 4
        raw.extend(rgba_data[row_start:row_start + width * 4])

    compressed = zlib.compress(bytes(raw))
    idat = chunk(b"IDAT", compressed)

    # IEND
    iend = chunk(b"IEND", b"")

    return sig + ihdr + idat + iend


def create_ico(sizes: list, output_path: str) -> None:
    """生成 ICO 文件"""
    images = []
    for s in sizes:
        rgba = create_rgba_image(s)
        png_data = create_png(s, s, rgba)
        images.append((s, png_data))

    # ICO header: reserved(2) + type(2) + count(2)
    header = struct.pack("<HHH", 0, 1, len(images))

    # 计算偏移
    dir_entry_size = 16
    data_offset = 6 + dir_entry_size * len(images)

    directory = bytearray()
    image_data = bytearray()

    for size, png_data in images:
        w = 0 if size >= 256 else size
        h = 0 if size >= 256 else size

        entry = struct.pack(
            "<BBBBHHII",
            w,              # width (0 = 256)
            h,              # height (0 = 256)
            0,              # color palette
            0,              # reserved
            1,              # color planes
            32,             # bits per pixel
            len(png_data),  # size of image data
            data_offset + len(image_data),  # offset
        )
        directory.extend(entry)
        image_data.extend(png_data)

    with open(output_path, "wb") as f:
        f.write(header)
        f.write(bytes(directory))
        f.write(bytes(image_data))


def main():
    ico_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.ico")
    sizes = [16, 32, 48, 64, 128, 256]
    create_ico(sizes, ico_path)
    print(f"Icon saved to {ico_path}")


if __name__ == "__main__":
    main()
