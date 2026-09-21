#!/usr/bin/env bash
# ==============================================================================
# スマホ接続用ローカルサーバー起動スクリプト (QRコード表示)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=8080
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

LOCAL_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | grep -v '^172\.' | head -n 1)
if [ -z "$LOCAL_IP" ]; then LOCAL_IP="localhost"; fi

MOBILE_URL="http://${LOCAL_IP}:${PORT}"

echo "======================================================================"
echo "  ゆるかわBGMコンポーザー (スマホ接続モード 🌸)"
echo "======================================================================"
echo "  [1] スマホをPCと同じWi-Fiに接続してください。"
echo "  [2] カメラで以下のQRコードを読み取るか、URLを開いてください:"
echo ""
echo "      URL: ${MOBILE_URL}"
echo "----------------------------------------------------------------------"

python3 -c "
import qrcode
qr = qrcode.QRCode(border=1)
qr.add_data('${MOBILE_URL}')
qr.make(fit=True)
qr.print_ascii(invert=True)
" || true

echo "----------------------------------------------------------------------"
echo "  終了するには [Ctrl + C] を押してください。"
echo "======================================================================"

python3 -m http.server "$PORT" --bind 0.0.0.0
