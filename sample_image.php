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

  // EXIFデータを取得
  $exif = exif_read_data($_FILES["imageFile"]["tmp_name"]);

  // 元データと保存先データ
  $tmpPath   = $_FILES["imageFile"]["tmp_name"];
  $imagePath = $savePath.".".$ext;


  // trimデータがある場合はデータ修正
  if(isset($_REQUEST["trim"])
  && $_REQUEST["trim"]["width"]  < $_REQUEST["info"]["width"]
  && $_REQUEST["trim"]["height"] < $_REQUEST["info"]["height"]){
    // 読み込み
    $thumb = imagecreatetruecolor($_REQUEST["trim"]["width"], $_REQUEST["trim"]["height"]);
    $source = imagecreatefromjpeg($tmpPath);

    $x1 = 0;
    $y1 = 0;
    $x2 = $_REQUEST["trim"]["left"];
    $y2 = $_REQUEST["trim"]["top"];
    $w1 = $_REQUEST["info"]["width"];
    $h1 = $_REQUEST["info"]["height"];
    $w2 = $_REQUEST["trim"]["width"];
    $h2 = $_REQUEST["trim"]["height"];

    // Trim - 90deg
    if($exif["Orientation"] == 6){
      $source = imagerotate($source, -90, 0);
      imagecopyresized($thumb, $source, $x1, $y1,  $x2, $y2, $w2, $h2, $w2, $h2);
    }
    // Trim - 180deg
    else if($exif["Orientation"] == 3){
      $source = imagerotate($source, -180, 0);
      imagecopyresized($thumb, $source, $x1, $y1,  $x2, $y2, $w2, $h2, $w2, $h2);
    }
    // Trim - 270deg
    else if($exif["Orientation"] == 8){
      $source = imagerotate($source, -270, 0);
      imagecopyresized($thumb, $source, $x1, $y1,  $x2, $y2, $w2, $h2, $w2, $h2);
    }
    // Trim - normal
    else{
      imagecopyresized($thumb, $source, $x1, $y1,  $x2, $y2, $w2, $h2, $w2, $h2);
    }
    

    // 出力
    imagejpeg($thumb , $imagePath);
    imagedestroy($thumb);
  }

  // trimデータが無い場合は、そのまま保存
  else{
    move_uploaded_file($tmpPath , $imagePath);
  }


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

