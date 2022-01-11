# 몰입캠프 2주차 과제

## 목차

+ [프로젝트 개요](#프로젝트-개요)
    + [목표](#목표)
    + [사용 언어, 툴](#사용-언어-툴)
    + [결과물](#결과물)


+ [탭별 주요코드 설명](#탭별-주요코드-설명)
    + [AllTweets](#AllTweets)
    + [Login](#Login)
    + [MyTweets](#MyTweets)

+ [구현 결과](#구현-결과)
    + [AllTweets](#AllTweets)
    + [Login](#Login)
    + [MyTweets](#MyTweets)
  

---------------------------


## 프로젝트 개요

### 목표
  + 서버를 활용한 앱 제작
  
### 목적
  + 서로 함께 공통의 과제를 함으로써 서버에 빠르게 익숙해지기
  
### 사용 언어, 툴
  + android studio
  + React
  + Node.js
  + MongoDB
  
### 탭별 주요코드 설명

  + AllTweets

```
 import * as tweetRepository from '../data/tweet.js';
import { getSocketIO } from '../connection/socket.js';

export async function getTweets(req, res) {
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
  const { text } = req.body;
  const tweet = await tweetRepository.create(text, req.userId);
  res.status(201).json(tweet);
  getSocketIO().emit('tweets', tweet);
}

export async function updateTweet(req, res, next) {
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
```
---------------------------

### 구현결과

