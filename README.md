MYNT-File-Uploader
==
- Author : Yugeta.Koji
- Date   : 2019.09.07 (ver2.0)
---

# Version
- Images.js
  * ver 1.0 : image
  * ver 1.1 : image-trim
  * ver 1.2 : image-orientation
  * ver 1.3 : sound
  * ver 1.4 : comment-input
  * ver 1.5 : sound : IDv3


# upload.php : データアップロード用受けCGI(php)の仕様
- アップロード後のファイル名はユニークファイル名として重複不具合を排除する。
- jsonデータに、必要な画像ファイル情報を、"ユニークファイル名.json"として保存する
- exifデータの保存（jsonデータに格納）


# データ送信
- 複数対応の為、送信後のファイル名に送信数の連番を付与する。


# Howto
- image-upload
  1. headタグ内にライブラリファイルを設置
  ```
    <script src="images.js"></script>
    <script src="exif.js"></script>
  ```

  2. body下段に実行コマンドを設置
    ```
    <script>
      new $$fileupload({
        url : "sample.php",
        querys       : {
          exit : true,
          size : 300
        },
        btn_selector : "#btn",
        file_select  : function(res , options){},
        post_success : function(res , options){console.log(res);},
        post_finish : function(res , options){console.log("finished !!!");},
        post_error : function(res , options){console.log(res);}
      });
    </script>
    ```

    * "image-sample.html"参照
    * ライブラリ内の"__options"変数は全て送り値として変更することが可能です。

# php.iniの設定（下記をセットしておかないと、全角文字化けになる）
[mbstring]
  - -mbstring.http_input = auto
  - +mbstring.http_input = UTF-8

# ID3取得関連
  https://github.com/creeperyang/id3-parser(未使用)
  mp3 : https://akabeko.me/blog/memo/mp3/
  wikipedia : https://ja.wikipedia.org/wiki/ID3%E3%82%BF%E3%82%B0
