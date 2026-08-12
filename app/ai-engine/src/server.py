import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import concurrent.futures
import logging
import time
import grpc

from src.service.generated import scented_candles_pb2
from src.service.generated import scented_candles_pb2_grpc

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ai-engine-grpc")

class ScentedCandlesAIServicer(scented_candles_pb2_grpc.ScentedCandlesAIServiceServicer):
    """Implementation của ScentedCandlesAIService gRPC Interface"""

    def StreamAIChat(self, request, context):
        logger.info(f"StreamAIChat request from user_id: {request.user_id}, message: '{request.message}'")
        welcome_text = f"Chào bạn! Tôi là Tư vấn viên Mùi hương AuraScent. Bạn vừa nói: '{request.message}'"
        for word in welcome_text.split(" "):
            time.sleep(0.05)
            yield scented_candles_pb2.ChatChunk(delta_text=word + " ", is_finished=False)
        yield scented_candles_pb2.ChatChunk(delta_text="", is_finished=True)

    def SmartSearch(self, request, context):
        logger.info(f"SmartSearch request query: '{request.query}', limit: {request.limit}")
        mock_products = [
            scented_candles_pb2.CandleProduct(
                id="mock-1",
                name="Nến Thơm Đà Lạt Pine & Amber",
                price=350000.0,
                image_url="https://example.com/pine.jpg",
                similarity_score=0.95,
            )
        ]
        return scented_candles_pb2.SearchResponse(products=mock_products)

    def ExtractCandleMetadata(self, request, context):
        logger.info(f"ExtractCandleMetadata request raw_description len: {len(request.raw_description)}")
        return scented_candles_pb2.ExtractResponse(
            top_notes=["Thông Đà Lạt", "Vỏ Chanh"],
            middle_notes=["Gỗ Thông", "Hổ Phách"],
            base_notes=["Rêu Phong", "Cỏ Hương Bài"],
            moods=["Ấm Cúng", "Thư Giãn", "Phòng Đọc Sách"],
        )

def serve():
    port = "50051"
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    scented_candles_pb2_grpc.add_ScentedCandlesAIServiceServicer_to_server(
        ScentedCandlesAIServicer(), server
    )
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    logger.info(f"gRPC AI Engine Server running on port {port}")
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Stopping gRPC Server...")
        server.stop(0)

if __name__ == "__main__":
    serve()
