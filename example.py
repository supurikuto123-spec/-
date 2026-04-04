#!/usr/bin/env python3
"""
Sutemeado API 使用例 - 簡単なメッセージ送受信スクリプト
"""

from sutemeado_client import SutemeadoClient, SutemeadoError

def main():
    # APIクライアント初期化（本番サーバー）
    client = SutemeadoClient("https://sutemeado.com")
    
    try:
        # 1. 新規アドレス作成
        print("=" * 50)
        print("ステップ1: 一時メールアドレスを作成")
        print("=" * 50)
        
        address = client.create_address(max_retries=3)
        
        print(f"\n📧 アドレス: {address.address}")
        print(f"🔑 パスワード: {address.password}")
        print("\n⚠️ 重要: このパスワードを保存してください!")
        print("   パスワードを忘れるとアクセスできなくなります。")
        
        # 2. メールを待機（オプション）
        print("\n" + "=" * 50)
        print("ステップ2: メールを待機（30秒間）")
        print("=" * 50)
        print(f"   {address.address} にメールを送信してください...")
        
        mail = client.wait_for_mail(timeout=30, check_interval=5)
        
        if mail:
            print(f"\n📨 メール受信!")
            print(f"   From: {mail.sender}")
            print(f"   Subject: {mail.subject}")
            print(f"   Body: {mail.body[:200]}...")
        else:
            print("\n⏰ メールが届きませんでした（タイムアウト）")
        
        # 3. クリーンアップ
        print("\n" + "=" * 50)
        print("ステップ3: アドレスを削除")
        print("=" * 50)
        
        confirm = input("アドレスを削除しますか？ (y/n): ").lower()
        if confirm == 'y':
            if client.delete_address():
                print("✅ アドレスを削除しました")
        else:
            print(f"\nアドレス情報を保存してください:")
            print(f"   アドレス: {address.address}")
            print(f"   パスワード: {address.password}")
        
    except SutemeadoError as e:
        print(f"\n❌ エラー: {e}")
    except KeyboardInterrupt:
        print("\n\n⚠️ 中断されました")

if __name__ == "__main__":
    main()
