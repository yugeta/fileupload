<?php
namespace mynt\plugin\fileupload;

header("Access-Control-Allow-Origin: *");

// echo "Upload...".$_FILES["imageFile"]["name"];
require_once "php/image.php";

// postデータを保存する
echo savePost_and_json();
echo PHP_EOL;
echo "finished !!!!!";

// uniqueファイル名+情報をiniファイルで保存
function savePost_and_json(){

  // 保存領域の確認
  $dir = "data/";
  if(!is_dir($dir)){
    mkdir($dir , 0777 , true);
  }

  // 保存パス
  $date = date("YmdHis");
  $time = time();
  $id   = $_REQUEST["id"]."_".$_REQUEST["num"];
  $savePath = $dir.$id;

  // 元ファイル名を取得
  $filename = \mynt\plugin\fileupload\image::getFilename();

  // 拡張子
  $ext = \mynt\plugin\fileupload\image::getExtension($filename);

  // EXIFデータを取得
  $exif = \mynt\plugin\fileupload\image::getExif();

  // 元データと保存先データ
  $imagePath = $savePath.".".$ext;

  // data-save
  \mynt\plugin\fileupload\image::save($imagePath);

  // saveデータ取得
  $json_data = array(
    "id" => $_REQUEST["id"],
    "filename" => $filename,
    "extension" => $ext,
    "date" => $time,
    "info" => $_REQUEST["info"],
    "trim" => (isset($_REQUEST["trim"])) ? $_REQUEST["trim"] : null,

    "postData" => $_FILES["imageFile"],
    "exif" => $exif
  );


  // EXIFデータ保存
  $exifPath = $savePath.".json";
  $saveJson = json_encode($json_data , JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  file_put_contents($exifPath , $saveJson);
  
}

