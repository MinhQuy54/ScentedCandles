FROM python:3.11-slim

WORKDIR /app

# noninteractive: tránh apt-get treo do prompt tzdata khi build không có TTY
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Biên dịch protobuf khớp với đường dẫn thực tế mà code import (src/service/generated/)
RUN mkdir -p ./src/service/generated \
    && python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./src/service/generated \
    --pyi_out=./src/service/generated \
    --grpc_python_out=./src/service/generated \
    ./proto/scented-candles.proto \
    && sed -i 's/import scented_candles_pb2/from . import scented_candles_pb2/g' ./src/service/generated/scented_candles_pb2_grpc.py \
    && touch ./src/service/generated/__init__.py

EXPOSE 50051

# Health check gRPC server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import grpc; channel = grpc.insecure_channel('localhost:50051'); grpc.channel_ready_future(channel).result(timeout=5)" || exit 1

# Run gRPC server
CMD ["python", "src/server.py"]
