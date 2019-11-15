'use strict'

// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const request = require("request");
const rp = require('request-promise');

// メッセージ
const message = {
  type: "text",
  text: "取り急ぎの犬です"
}

// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// 犬APIを叩く時に使う情報
const options = {
  url: "https://dog.ceo/api/breeds/image/random",
  method: "GET",
  json: true
}

// Webサーバー設定
server.listen(process.env.PORT || 3000);

// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
  // 先行してLINE側にステータスコード200でレスポンスする。
  res.sendStatus(200);
  
  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
    // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
    if (event.type == "message" && event.message.type == "text"){
      rp(options)
        .then(function (repos) {
          return {
              "type": "image",
              "originalContentUrl": repos.message,
              "previewImageUrl": repos.message
            };
            return image;
          })
        .then(function (image) {
          bot.replyMessage(event.replyToken, [message, image]);
        })
        .catch(function (err) {
          console.dir(err);
        });
    } else {
      // replyMessage()で返信し、そのプロミスをevents_processedに追加。
      bot.replyMessage(event.replyToken, {
        type: "text",
        text: "犬が欲しいと送ってみて"
      });
    }
  });
});