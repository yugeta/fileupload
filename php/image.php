<?php
namespace mynt\lib\fileupload;

class image{

  public static function getDataInfo(){
    $filename = $_FILES["imageFile"]["name"];
    $exif = exif_read_data($_FILES["imageFile"]["tmp_name"]);

  }

  public static function trim($savePath , $base_width="" , $base_height="" ,
  $trim_width="" , $trim_height="" , $trim_top="" , $trim_left=""){

    $exif        = self::getExif();
    $tmpPath     = self::getSystemfilePath();
    $base_width  = ($base_width)  ? $base_width  : $_REQUEST["info"]["width"];
    $base_height = ($base_height) ? $base_height : $_REQUEST["info"]["height"];
    $trim_width  = ($trim_width)  ? $trim_width  : $_REQUEST["trim"]["width"];
    $trim_height = ($trim_height) ? $trim_height : $_REQUEST["trim"]["height"];
    $trim_top    = ($trim_top)    ? $trim_top    : $_REQUEST["trim"]["top"];
    $trim_left   = ($trim_left)   ? $trim_left   : $_REQUEST["trim"]["left"];
    

    if(isset($_REQUEST["trim"])
    && $trim_width  < $base_width
    && $trim_height < $base_height){
      // 読み込み
      $thumb = imagecreatetruecolor($trim_width, $trim_height);
      $source = imagecreatefromjpeg($tmpPath);

      $x1 = 0;
      $y1 = 0;
      $x2 = $trim_left;
      $y2 = $trim_top;
      $w1 = $base_width;
      $h1 = $base_height;
      $w2 = $trim_width;
      $h2 = $trim_height;

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
      imagejpeg($thumb , $savePath);
      imagedestroy($thumb);
    }
  }


  // ファイル名の取得
  public static function getFilename(){
    return $_FILES["imageFile"]["name"];
  }

  // システム保存ファイルの取得
  public static function getSystemfilePath(){
    return $_FILES["imageFile"]["tmp_name"];
  }

  // EXIFデータを取得
  public static function getExif($file=""){
    $file = ($file) ? $file : self::getSystemfilePath();
    if(is_file($file)){
      return exif_read_data($file);
    }
    else{
      return null;
    }
  }

  // ファイル名から拡張子の取得
  public static function getExtension($file){
    $file = ($file) ? $file : self::getFilename();
    if($file){
      return pathinfo($file)["extension"];
    }
    else{
      return;
    }
  }

  // file-save
  public static function save($savepath){
    // trimデータがある場合はデータ修正
    if(isset($_REQUEST["trim"])
    && $_REQUEST["trim"]["width"]  < $_REQUEST["info"]["width"]
    && $_REQUEST["trim"]["height"] < $_REQUEST["info"]["height"]){
      self::trim($savepath);
    }

    // trimデータが無い場合は、そのまま保存
    else{
      self::upload($savepath);
    }
  }

  // upload-file-move
  public static function upload($savepath , $basepath=""){
    $basepath = ($basepath) ? $basepath : $_FILES["imageFile"]["tmp_name"];
    move_uploaded_file($basepath , $savepath);
  }
}