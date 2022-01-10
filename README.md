# madcamp2

#몰입캠프 2주차 과제

##목차

+프로젝트 개요
+목표
+사용언어, 툴
+결과물

+탭별 주요코드 설명
+AllTweets
+Login
+MyTweets


+구현결과
+AllTweets
+Login
+MyTweets

프로젝트 개요
목표 : 서버를 활용한 앱 제작
사용 언어, 툴
react 
node.js
mongoDB

주요 코드
'''
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../data/auth.js';

const AUTH_ERROR = { message: 'Authentication Error' };

export const isAuth = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!(authHeader && authHeader.startsWith('Bearer '))) {
    return res.status(401).json(AUTH_ERROR);
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }
    req.userId = user.id; // req.customData
    next();
  });
  
};
'''

...
import * as tweetRepository from "../data/tweet.js";
//데이터에 있는 tweet파일을 불러와서 처리해요
import { getSocketIO } from "../connection/socket.js";

export async function getTweets(req, res) {
  //async ->비동기적처리
  //data폴더 안에 tweets.js파일 참고하면 좋아요
  //트윗을 불러옵니다
  const username = req.query.username;
  const data = await (username
    ? tweetRepository.getAllByUsername(username)
    : tweetRepository.getAll());
  res.status(200).json(data);
}

export async function getTweet(req, res, next) {
  const id = req.params.id;
  const tweet = await tweetRepository.getById(id);
  if (tweet) {
    res.status(200).json(tweet);
  } else {
    res.status(404).json({ message: `Tweet id(${id}) not found` });
  }
}

export async function createTweet(req, res, next) {
  //트윗을 새로 만들어요
  const { text } = req.body; //text창에 입력한 글
  const tweet = await tweetRepository.create(text, req.userId);
  res.status(201).json(tweet);
  getSocketIO().emit("tweets", tweet);
}

export async function updateTweet(req, res, next) {
  //트윗 수정
  const id = req.params.id;
  const text = req.body.text;
  const tweet = await tweetRepository.getById(id);
  if (!tweet) {
    return res.status(404).json({ message: `Tweet not found: ${id}` });
  }
  if (tweet.userId !== req.userId) {
    return res.sendStatus(403);
  }
  const updated = await tweetRepository.update(id, text);
  res.status(200).json(updated);
}

export async function deleteTweet(req, res, next) {
  //트윗 삭제
  const id = req.params.id;
  const tweet = await tweetRepository.getById(id);
  if (!tweet) {
    return res.status(404).json({ message: `Tweet not found: ${id}` });
  }
  if (tweet.userId !== req.userId) {
    return res.sendStatus(403);
  }
  await tweetRepository.remove(id);
  res.sendStatus(204);
}
...


결과물
