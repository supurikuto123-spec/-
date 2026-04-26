#!/usr/bin/env python3
"""
Sutemeado API テストスクリプト
"""

import requests
import sys

BASE_URL = "http://localhost:3004"  # ローカルサーバー

def test_new_address():
    """新規アドレス作成テスト"""
    print("捨てメアドを作成中...")
    
    for i in range(5):
        print(f"アドレス作成を試行中... ({i+1}/5)")
        try:
            response = requests.get(f"{BASE_URL}/api/new-address", timeout=10)
            print(f"ステータスコード: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print(f"✅ 成功!")
                    print(f"   アドレス: {data.get('address')}")
                    print(f"   パスワード: {data.get('password')}")
                    return data
                else:
                    print(f"❌ APIエラー: {data.get('error')}")
            else:
                print(f"❌ HTTP {response.status_code} で失敗")
                print(f"   レスポンス: {response.text}")
                
        except requests.exceptions.ConnectionError as e:
            print(f"❌ 接続エラー: {e}")
            print(f"   サーバーが起動しているか確認してください: {BASE_URL}")
        except Exception as e:
            print(f"❌ エラー: {e}")
    
    return None

def test_login(address, password):
    """ログインテスト"""
    print(f"\nログインテスト...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/login",
            json={"address": address, "password": password},
            timeout=10
        )
        data = response.json()
        
        if response.status_code == 200 and data.get("success"):
            print(f"✅ ログイン成功!")
            print(f"   メール数: {data.get('count', 0)}")
            return True
        else:
            print(f"❌ ログイン失敗: {data.get('error')}")
            return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def test_status():
    """サーバーステータス確認"""
    print(f"\nサーバーステータス確認...")
    try:
        response = requests.get(f"{BASE_URL}/api/status", timeout=10)
        data = response.json()
        
        if response.status_code == 200 and data.get("success"):
            print(f"✅ サーバー稼働中")
            print(f"   ステータス: {data.get('status')}")
            print(f"   稼働時間: {data.get('uptime', 0):.0f}秒")
            print(f"   メールボックス数: {data.get('stats', {}).get('mailboxes', 0)}")
            print(f"   総メール数: {data.get('stats', {}).get('totalMails', 0)}")
            return True
        else:
            print(f"❌ ステータス取得失敗")
            return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Sutemeado API テスト")
    print(f"接続先: {BASE_URL}")
    print("=" * 50)
    
    # ステータス確認
    if not test_status():
        print("\n⚠️ サーバーが応答しません。サーバーが起動しているか確認してください。")
        print(f"   cd /home/user/webapp && PORT=3004 node server.js")
        sys.exit(1)
    
    # アドレス作成テスト
    result = test_new_address()
    if result:
        # ログインテスト
        test_login(result["address"], result["password"])
        print("\n✅ すべてのテストが成功しました!")
    else:
        print("\n❌ アドレス作成に失敗しました")
        sys.exit(1)
