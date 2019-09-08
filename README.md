MYNT-File-Uploader
==
- Author : Yugeta.Koji
- Date   : 2019.09.07 (ver2.0)
---

# Version
- Images.js
  * ver 1.0


# upload.php : データアップロード用受けCGI(php)の仕様
- アップロード後のファイル名はユニークファイル名として重複不具合を排除する。
- jsonデータに、必要な画像ファイル情報を、"ユニークファイル名.json"として保存する
- exifデータの保存（jsonデータに格納）


# データ送信
- 複数対応の為、送信後のファイル名に送信数の連番を付与する。


# Howto
- "image-sample.html"を参照

