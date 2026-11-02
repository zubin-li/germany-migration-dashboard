#!/bin/bash
# =============================================================================
# 一键生成离线免配置分享包 (Zero-Config Offline Shareable Package)
# =============================================================================
# 将前端完整的 HTML、CSS、JS、图表引擎及官方离线数据库打包为 ZIP 文件。
# 接收方解压后直接双击 index.html 或 findings.html 即可使用，无需安装 Python / Node！
# =============================================================================

set -e
cd "$(dirname "$0")"

OUTPUT_NAME="germany-migration-dashboard-offline.zip"
rm -f "$OUTPUT_NAME"

echo "正在生成离线免配置分享包..."

zip -r "$OUTPUT_NAME" \
  index.html \
  findings.html \
  app.js \
  findings.js \
  i18n.js \
  data.js \
  styles.css \
  vendor/ \
  docs/ \
  README.md \
  -x "*.DS_Store" "*__pycache__*"

echo "=========================================================="
echo "✅ 离线免配置分享包生成成功！"
echo "文件路径: $(pwd)/$OUTPUT_NAME"
echo "文件大小: $(ls -lh "$OUTPUT_NAME" | awk '{print $5}')"
echo "=========================================================="
echo "分享说明:"
echo "1. 将此 zip 文件直接通过微信/邮件/Slack 发送给同事或领导。"
echo "2. 对方收到后直接解压，双击 index.html 即可在任何浏览器中打开交互！"
echo "3. 对方电脑无需安装 Python、Node.js，也无需敲任何命令。"
echo "=========================================================="
