<?php

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
  $filename = $_FILES["imageFile"]["name"];

  // 拡張子
  $ext = pathinfo($filename)["extension"];

  // 実データを格納
  $imagePath = $savePath.".".$ext;
  move_uploaded_file($_FILES["imageFile"]["tmp_name"] , $imagePath);

  // EXIFデータを取得
  $exif = exif_read_data($imagePath);
  $json_data = array(
    "id" => $_REQUEST["id"],
    "filename" => $filename,
    "extension" => $ext,
    "date" => $time,
    "postData" => $_FILES["imageFile"],
    "exif" => $exif
  );

  // EXIFデータ保存
  $exifPath = $savePath.".json";
  $saveJson = json_encode($json_data , JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  file_put_contents($exifPath , $saveJson);
  
}