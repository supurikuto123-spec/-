#!/usr/bin/env python3
"""
診断用テストスクリプト
"""
import sys
import traceback

print("=" * 50)
print("診断開始")
print(f"Pythonバージョン: {sys.version}")
print(f"実行パス: {sys.executable}")
print("=" * 50)

try:
    print("\n[1/4] requestsモジュールをインポート中...")
    import requests
    print(f"   ✅ requests {requests.__version__}")
    
    print("\n[2/4] sutemeado_clientをインポート中...")
    from sutemeado_client import SutemeadoClient, SutemeadoError
    print("   ✅ sutemeado_client インポート成功")
    
    print("\n[3/4] API接続テスト...")
    client = SutemeadoClient("https://sutemeado.com", timeout=10)
    
    # 簡単なステータスチェック
    try:
        response = requests.get("https://sutemeado.com/api/status", timeout=10)
        print(f"   ステータスコード: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   サーバーステータス: {data.get('status', 'unknown')}")
        else:
            print(f"   ⚠️ サーバーが異常ステータスを返しました: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ 接続エラー: {e}")
    
    print("\n[4/4] アドレス作成テスト...")
    try:
        addr = client.create_address(max_retries=2)
        print(f"   ✅ 成功: {addr.address}")
    except SutemeadoError as e:
        print(f"   ❌ APIエラー: {e}")
    except Exception as e:
        print(f"   ❌ 予期しないエラー: {e}")
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("診断完了")
    print("=" * 50)
    
except ImportError as e:
    print(f"\n❌ インポートエラー: {e}")
    print("sutemeado_client.py が同じフォルダにあるか確認してください")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ 予期しないエラー: {e}")
    traceback.print_exc()
    sys.exit(1)
