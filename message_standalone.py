#!/usr/bin/env python3
"""
Sutemeado 一時メールサービス - スタンドアロンクライアント
単一ファイルで動作します。必要なライブラリ: requests

インストール: pip install requests
使用方法: python message_standalone.py
"""

import requests
import time
import json
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

# ============== 設定 ==============
BASE_URL = "https://sutemeado.com"  # APIサーバーURL
TIMEOUT = 30  # リクエストタイムアウト（秒）
MAX_RETRIES = 5  # 最大リトライ回数
RETRY_DELAY = 1.0  # リトライ間隔（秒）


# ============== データクラス ==============
@dataclass
class Mail:
    """メールオブジェクト"""
    id: str
    subject: str
    sender: str
    body: str
    html: Optional[str]
    received_at: int
    received_at_formatted: str


@dataclass
class Address:
    """アドレスオブジェクト"""
    address: str
    password: str
    domain: str


# ============== 例外クラス ==============
class SutemeadoError(Exception):
    """Sutemeado APIエラー"""
    pass


class SutemeadoAuthError(SutemeadoError):
    """認証エラー"""
    pass


# ============== APIクライアントクラス ==============
class SutemeadoClient:
    """
    Sutemeado一時メールサービスのPythonクライアント
    """

    def __init__(self, base_url: str = BASE_URL, timeout: int = TIMEOUT):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SutemeadoPythonClient/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        self._address: Optional[str] = None
        self._password: Optional[str] = None

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """APIリクエストを実行"""
        url = f"{self.base_url}{endpoint}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                timeout=self.timeout,
                **kwargs
            )

            # HTTPエラーチェック
            if response.status_code == 401:
                raise SutemeadoAuthError("認証に失敗しました。パスワードが正しくありません。")
            elif response.status_code == 404:
                raise SutemeadoError("メールアドレスが見つかりません")
            elif response.status_code == 500:
                error_data = response.json() if response.text else {}
                detail = error_data.get('detail', 'サーバーエラー')
                raise SutemeadoError(f"サーバーエラー: {detail}")

            response.raise_for_status()

            data = response.json()

            if not data.get('success', False):
                error_msg = data.get('error', 'Unknown error')
                raise SutemeadoError(f"APIエラー: {error_msg}")

            return data

        except requests.exceptions.ConnectionError:
            raise SutemeadoError(f"接続エラー: {self.base_url} に接続できません")
        except requests.exceptions.Timeout:
            raise SutemeadoError(f"タイムアウト: {self.timeout}秒以内に応答がありません")
        except requests.exceptions.RequestException as e:
            raise SutemeadoError(f"リクエストエラー: {e}")

    def create_address(self, max_retries: int = MAX_RETRIES, retry_delay: float = RETRY_DELAY) -> Address:
        """
        新しい一時メールアドレスを作成

        Args:
            max_retries: 最大リトライ回数
            retry_delay: リトライ間隔（秒）

        Returns:
            Addressオブジェクト
        """
        print("捨てメアドを作成中...")

        for attempt in range(1, max_retries + 1):
            print(f"アドレス作成を試行中... ({attempt}/{max_retries})")

            try:
                data = self._request('GET', '/api/new-address')

                address = Address(
                    address=data['address'],
                    password=data['password'],
                    domain=data.get('domain', 'sutemeado.com')
                )

                # セッションを保存
                self._address = address.address
                self._password = address.password

                print(f"✅ 成功!")
                print(f"   アドレス: {address.address}")
                print(f"   パスワード: {address.password}")

                return address

            except SutemeadoError as e:
                print(f"❌ 失敗: {e}")
                if attempt < max_retries:
                    print(f"   {retry_delay}秒後にリトライ...")
                    time.sleep(retry_delay)
                else:
                    raise SutemeadoError(f"{max_retries}回試行しましたが、アドレスの作成に失敗しました")

        raise SutemeadoError("アドレス作成に失敗しました")

    def login(self, address: str, password: str) -> List[Mail]:
        """
        既存のアドレスにログインしてメール一覧を取得

        Args:
            address: メールアドレス
            password: パスワード

        Returns:
            メールオブジェクトのリスト
        """
        print(f"\nログイン中... {address}")

        data = self._request('POST', '/api/login', json={
            'address': address,
            'password': password
        })

        # セッションを保存
        self._address = address
        self._password = password

        print(f"✅ ログイン成功!")
        print(f"   メール数: {data.get('count', 0)}")

        mails = []
        for mail_data in data.get('mails', []):
            mails.append(Mail(
                id=mail_data['id'],
                subject=mail_data['subject'],
                sender=mail_data['from'],
                body=mail_data['body'],
                html=mail_data.get('html'),
                received_at=mail_data['receivedAt'],
                received_at_formatted=mail_data['receivedAtFormatted']
            ))

        return mails

    def get_mails(self) -> List[Mail]:
        """
        現在のセッションのメール一覧を取得
        （create_addressまたはlogin後に使用）
        """
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません。create_address()またはlogin()を先に実行してください")

        return self.login(self._address, self._password)

    def get_mail_detail(self, mail_id: str) -> Mail:
        """
        特定のメールの詳細を取得

        Args:
            mail_id: メールID
        """
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません")

        data = self._request('POST', f'/api/mailbox/{self._address}/{mail_id}', json={
            'password': self._password
        })

        mail_data = data['mail']
        return Mail(
            id=mail_data['id'],
            subject=mail_data['subject'],
            sender=mail_data['from'],
            body=mail_data['body'],
            html=mail_data.get('html'),
            received_at=mail_data['receivedAt'],
            received_at_formatted=mail_data['receivedAtFormatted']
        )

    def delete_mail(self, mail_id: str) -> bool:
        """
        特定のメールを削除

        Args:
            mail_id: 削除するメールID
        """
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません")

        data = self._request('DELETE', f'/api/mailbox/{self._address}/{mail_id}', json={
            'password': self._password
        })

        return data.get('success', False)

    def clear_all_mails(self) -> bool:
        """全てのメールを削除"""
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません")

        data = self._request('DELETE', f'/api/mailbox/{self._address}', json={
            'password': self._password
        })

        return data.get('success', False)

    def delete_address(self) -> bool:
        """アドレスを完全に削除"""
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません")

        data = self._request('DELETE', f'/api/address/{self._address}', json={
            'password': self._password
        })

        if data.get('success', False):
            self._address = None
            self._password = None
            return True
        return False

    def change_password(self, new_password: str, current_password: Optional[str] = None) -> bool:
        """
        パスワードを変更

        Args:
            new_password: 新しいパスワード
            current_password: 現在のパスワード（省略時はセッションのパスワードを使用）
        """
        address = self._address
        old_pass = current_password or self._password

        if not address or not old_pass:
            raise SutemeadoError("セッションがありません")

        data = self._request('PUT', f'/api/address/{address}/password', json={
            'currentPassword': old_pass,
            'newPassword': new_password
        })

        if data.get('success', False):
            self._password = new_password
            return True
        return False

    def wait_for_mail(self, timeout: int = 300, check_interval: int = 5) -> Optional[Mail]:
        """
        新しいメールが届くまで待機

        Args:
            timeout: 最大待機時間（秒）
            check_interval: 確認間隔（秒）

        Returns:
            受信したメール、タイムアウト時はNone
        """
        if not self._address or not self._password:
            raise SutemeadoError("セッションがありません")

        print(f"\n⏳ メールを待機中... (最大{timeout}秒)")
        print(f"   アドレス: {self._address}")

        start_time = time.time()
        initial_mails = {m.id for m in self.get_mails()}

        while time.time() - start_time < timeout:
            mails = self.get_mails()
            current_ids = {m.id for m in mails}

            # 新しいメールを検出
            new_ids = current_ids - initial_mails
            if new_ids:
                newest_id = max(new_ids, key=lambda mid: next(m.received_at for m in mails if m.id == mid))
                newest_mail = next(m for m in mails if m.id == newest_id)
                print(f"\n✅ 新しいメールを受信!")
                print(f"   件名: {newest_mail.subject}")
                print(f"   送信者: {newest_mail.sender}")
                return newest_mail

            time.sleep(check_interval)
            print(f"   確認中... ({int(time.time() - start_time)}秒経過)")

        print("\n⚠️ タイムアウト: メールが届きませんでした")
        return None

    @property
    def current_address(self) -> Optional[str]:
        """現在のアドレス"""
        return self._address

    @property
    def current_password(self) -> Optional[str]:
        """現在のパスワード"""
        return self._password


# ============== メイン処理 ==============
def main():
    """メイン関数 - 使用例"""
    print("=" * 60)
    print("Sutemeado 一時メールクライアント")
    print(f"接続先: {BASE_URL}")
    print("=" * 60)

    # クライアント初期化
    client = SutemeadoClient(BASE_URL, TIMEOUT)

    try:
        # 1. 新規アドレス作成
        print("\n【ステップ1】一時メールアドレスを作成")
        address = client.create_address()

        print(f"\n📧 アドレス: {address.address}")
        print(f"🔑 パスワード: {address.password}")
        print("\n⚠️ 重要: このパスワードを保存してください!")
        print("   パスワードを忘れるとアクセスできなくなります。")

        # 2. メールを待機（オプション）
        print("\n【ステップ2】メールを待機（30秒間）")
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
        print("\n【ステップ3】クリーンアップ")
        confirm = input("アドレスを削除しますか？ (y/n): ").lower()

        if confirm == 'y':
            if client.delete_address():
                print("✅ アドレスを削除しました")
        else:
            print(f"\n💾 アドレス情報を保存してください:")
            print(f"   アドレス: {address.address}")
            print(f"   パスワード: {address.password}")

        print("\n" + "=" * 60)
        print("処理完了")
        print("=" * 60)

    except SutemeadoError as e:
        print(f"\n❌ エラー: {e}")
        return 1
    except KeyboardInterrupt:
        print("\n\n⚠️ 中断されました")
        return 130

    return 0


# ============== スクリプトとして実行 ==============
if __name__ == "__main__":
    exit(main())
