#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动德国移民数据智能分析平台本地服务..."
open "http://localhost:8080"
/opt/homebrew/bin/python3 server.py || python3 server.py
