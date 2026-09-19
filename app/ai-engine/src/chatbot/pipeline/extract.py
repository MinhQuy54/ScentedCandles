import os
import json
import logging
from pathlib import Path

from sqlalchemy import create_engine, text
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR = str(DATA_DIR)

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    raise ValueError("DATABASE_URL is not set")
engine = create_engine(DB_URL)


def extract_data_to_jsonl(output_file:str):
    logger.info("--- Bắt đầu trích xuất dữ liệu (bao gồm Stock) ---")

    try:
        with engine.connect() as connection:
            query = text("""
            SELECT
                p.id AS product_id, p.sku, p.name, p.slug, p.short_description, p.raw_description, p.price,
                p.compare_at_price, p.status, p.is_featured, p.weight_grams, p.burn_time_hours,
                c.name AS category_name, c.slug AS category_slug,
                i.quantity_on_hand, i.quantity_reserved,
                (i.quantity_on_hand - i.quantity_reserved) AS quantity_available, i.low_stock_threshold,
                pi.url AS image_url

            FROM products p LEFT JOIN categories c
                ON p.category_id = c.id
                            LEFT JOIN inventory i
                ON p.id = i.product_id
                            LEFT JOIN product_images pi
                ON p.id = pi.product_id AND pi.is_primary = TRUE

            WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE' AND c.is_active = TRUE

            ORDER BY p.created_at DESC
            """)
            result = connection.execute(query).mappings()
            count = 0
            with open(output_file, "w", encoding="utf-8") as f:
                for r in result:
                    quantity_on_hand = r['quantity_on_hand'] or 0
                    quantity_reserved = r['quantity_reserved'] or 0
                    quantity_available = r['quantity_available'] or 0

                    inventory_status = (
                        "Còn hàng"
                        if quantity_available > 0
                        else "Hết hàng"
                    )

                    context_text = f"""
                Tên sản phẩm: {r['name']}
                SKU: {r['sku']}
                Danh mục: {r['category_name']}

                Mô tả ngắn: {r['short_description'] or 'Không có'}
                Mô tả chi tiết: {r['raw_description'] or 'Không có'}

                Giá bán: {float(r['price']):,.0f} VNĐ
                Giá niêm yết: {
                    f"{float(r['compare_at_price']):,.0f} VNĐ"
                    if r['compare_at_price'] is not None
                    else "Không có"
                }

                Trạng thái sản phẩm: {r['status']}
                Sản phẩm nổi bật: {'Có' if r['is_featured'] else 'Không'}

                Khối lượng: {
                    f"{r['weight_grams']} gram"
                    if r['weight_grams'] is not None
                    else "Không có"
                }

                Thời gian đốt: {
                    f"{r['burn_time_hours']} giờ"
                    if r['burn_time_hours'] is not None
                    else "Không có"
                }

                Tồn kho: {quantity_on_hand} sản phẩm
                Đã giữ chỗ: {quantity_reserved} sản phẩm
                Số lượng có thể bán: {quantity_available} sản phẩm
                Trạng thái tồn kho: {inventory_status}
                Ngưỡng tồn kho thấp: {r['low_stock_threshold'] or 0}

                Hình ảnh sản phẩm: {r['image_url'] or 'Không có'}
                """.strip()

                    doc = {
                        "doc_id": f"prod_{r['product_id']}",
                        "content": context_text,
                        "metadata": {
                            "category": r['category_name'],
                            "price": float(r['price']),
                            "stock": int(quantity_available),
                            "type": "product_info"
                        }
                    }

                    f.write(
                        json.dumps(
                            doc,
                            ensure_ascii=False
                        ) + "\n"
                    )

                    count += 1
            logger.info(f"Đã trích xuất {count} sản phẩm thành công!")
    except Exception as e:
        logger.error(f"Lỗi khi extract data: {e}")

if __name__ == '__main__':
    output_path = os.path.join(DATA_DIR, 'products_for_rag.jsonl')
    extract_data_to_jsonl(output_path)


