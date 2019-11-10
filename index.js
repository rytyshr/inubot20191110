'use strict'

// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const request = require('request');

// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// 犬APIを叩く時に使う使う情報
const options = {
  url: 'https://dog.ceo/api/breeds/image/random',
  method: 'GET',
  json: true
}

// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
  // 先行してLINE側にステータスコード200でレスポンスする。
  res.sendStatus(200);

  // すべてのイベント処理のプロミスを格納する配列。
  let events_processed = [];

  //犬画像URL
  let inu_url = '';

  // 犬APIを叩く
  request(options, function (error, response, body) {
    console.log(body.message);
    inu_url = body.message;
  });

  // 画像情報
  let image = {
    "type": "image",
    "originalContentUrl": inu_url,
    "previewImageUrl": inu_url
  };

  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
      // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
      if (event.type == "message" && event.message.type == "text"){
        // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
          if (event.message.text == "こんにちは"){
            // replyMessage()で返信し、そのプロミスをevents_processedに追加。
              events_processed.push(bot.replyMessage(event.replyToken, image));
          }
      }
  });

  // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
  Promise.all(events_processed).then(
      (response) => {
          console.log(`${response.length} event(s) processed.`);
      }
  );
});