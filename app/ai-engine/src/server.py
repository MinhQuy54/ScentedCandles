import sys
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import concurrent.futures
import logging
import time
import grpc

from src.service.generated import scented_candles_pb2
from src.service.generated import scented_candles_pb2_grpc

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ai-engine-grpc")

class HealthCheckHandler(BaseHTTPRequestHandler):
    """Simple HTTP Handler cho Render Web Service health check"""
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"OK")

    def log_message(self, format, *args):
        pass  # Tắt log HTTP thừa

def start_health_check_server():
    http_port = int(os.environ.get("PORT", 10000))
    httpd = HTTPServer(("0.0.0.0", http_port), HealthCheckHandler)
    logger.info(f"HTTP Health Check Server running on port {http_port}")
    httpd.serve_forever()

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
    # Khởi chạy HTTP Health Check trên thread phụ để đáp ứng Render Free Web Service
    health_thread = threading.Thread(target=start_health_check_server, daemon=True)
    health_thread.start()

    grpc_port = "50051"
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    scented_candles_pb2_grpc.add_ScentedCandlesAIServiceServicer_to_server(
        ScentedCandlesAIServicer(), server
    )
    server.add_insecure_port(f"[::]:{grpc_port}")
    server.start()
    logger.info(f"gRPC AI Engine Server running on port {grpc_port}")
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Stopping gRPC Server...")
        server.stop(0)

if __name__ == "__main__":
    serve()
