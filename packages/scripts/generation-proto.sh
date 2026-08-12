#!/bin/bash

PROTO_DIR="packages/proto"
PROTO_FILE="scented-candles.proto"

NEST_OUT="app/api-gateway/src/proto/generated"
PYTHON_OUT="app/ai-engine/src/service/generated"

echo "Start compile gRPC Proto..."

mkdir -p $NEST_OUT
mkdir -p $PYTHON_OUT

echo "Generating TypeScript Stubs for NestJS..."
npx protoc \
  --plugin=./app/api-gateway/node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$NEST_OUT \
  --ts_proto_opt=nestJs=true \
  --proto_path=$PROTO_DIR \
  $PROTO_DIR/$PROTO_FILE

PYTHON_BIN="python3"
if [ -f "./app/ai-engine/env/bin/python" ]; then
  PYTHON_BIN="./app/ai-engine/env/bin/python"
fi

echo "Generating Python Stubs for AI Engine using $PYTHON_BIN..."
$PYTHON_BIN -m grpc_tools.protoc \
  -I$PROTO_DIR \
  --python_out=$PYTHON_OUT \
  --pyi_out=$PYTHON_OUT \
  --grpc_python_out=$PYTHON_OUT \
  $PROTO_DIR/$PROTO_FILE

sed -i '' 's/import scented_candles_pb2/from . import scented_candles_pb2/g' "$PYTHON_OUT/scented_candles_pb2_grpc.py" 2>/dev/null || sed -i 's/import scented_candles_pb2/from . import scented_candles_pb2/g' "$PYTHON_OUT/scented_candles_pb2_grpc.py"

touch $PYTHON_OUT/__init__.py

echo "Compile gRPC Proto success!"