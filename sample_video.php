<?php

header("Access-Control-Allow-Origin: *");
// echo "Upload...".$_FILES["imageFile"]["name"];

// postデータを保存する
savePost_and_json();
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
  $filename = $_FILES["videoFile"]["name"];

  // 拡張子
  $ext = pathinfo($filename)["extension"];

  // EXIFデータを取得
  $exif = exif_read_data($_FILES["videoFile"]["tmp_name"]);

  // 元データと保存先データ
  $tmpPath   = $_FILES["videoFile"]["tmp_name"];
  $imagePath = $savePath.".".$ext;


  // trimデータが無い場合は、そのまま保存
  move_uploaded_file($tmpPath , $imagePath);

  // saveデータ取得
  $json_data = array(
    "id"        => $_REQUEST["id"],
    "filename"  => $filename,
    "extension" => $ext,
    "date"      => $time,
    "info"      => $_REQUEST["info"],
    "postData"  => $_FILES["videoFile"]
  );


  // EXIFデータ保存
  $exifPath = $savePath.".json";
  $saveJson = json_encode($json_data , JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  file_put_contents($exifPath , $saveJson);
  
}


