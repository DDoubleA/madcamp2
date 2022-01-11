# 몰입캠프 2주차 과제
<img width="100%" src="https://user-images.githubusercontent.com/86216960/148906316-7dbe8813-65cd-4091-aa60-50f3103c2f56.gif" />
<p align="center"><em>지금, 해로운 새가 날갯짓을 시작했다.</em></p>
<p align="center"><em>At the moment, injurious bird started flapping.</em></p>

## 목차

+ [프로젝트 개요](#프로젝트-개요)
    + [목표](#목표)
    + [사용 언어, 툴](#사용-언어-툴)
    + [결과물](#결과물)


+ [탭별 주요코드 & 결과화면 ](#탭별-주요코드-결과)
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
  
### 탭별 주요코드 설명 및 구현결과

  + AllTweets


|All Tweets|Edit Tweet|
|:-:|:-:|
|<img src="https://user-images.githubusercontent.com/86216960/148919887-fc51cc82-4650-43da-8d3e-881d2418b3f2.png" width="200" />|<img src="https://user-images.githubusercontent.com/86216960/148919880-5e5553be-ecc3-4dd0-b678-be338d866b8d.png" width="200" />|

웹소켓을 통해 실시간으로 트윗을 업로드 하도록 구현했습니다. 그리고 도배를 방지하기 위해 최소 3글자 이상 작성하도록 제한을 두었고 다른 사람 트윗의 아이디를 클릭하면 그 사람이 남긴 모든 트윗글들을 볼 수 있습니다. 
그리고 자신이 작성한 트윗은 수정, 삭제가 가능하며 이 기능 또한 실시간으로 업로드 됩니다. 글 밑에 태그를 남길 수 있도록 구현하였습니다. 또한 실시간 타임 체크를 통해 현재 시간을 기준으로 언제 글이 작성되었는지를 확인할 수 있도록 구현하였습니다.

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
  + Login

|Login|Make Account|
|:-:|:-:|
|<img src="https://user-images.githubusercontent.com/86216960/148919883-2d14e3aa-4322-49da-ad90-fcc02f7d82c4.png" width="200" />|<img src="https://user-images.githubusercontent.com/86216960/148919885-7bfc2eac-16ff-4d77-b7d8-2f72c3a378df.png" width="200" />|

로그인 페이지에서 먼저 회원가입을 가능하게 구현했습니다. 회원가입은 사용자 이름, 아이디, 비밀번호, 이메일, 프로필 이미지 URL을 받아오고 아이디와 이메일이 기존에 존재하는지 유효성 검사를 통해 존재하지 않으면 DB에 저장합니다. 그리고 비밀번호는 bcrypt hashing 알고리즘을 통해 인코딩 시켰고, 클라이언트가 요청하여 토큰을 받아올 경우 미들웨어에서 토큰의 권한과 기간이 유효한지 확인하고 받아올 수 있도록 했습니다. 프로필 이미지 URL이 유효하지 않은 경로일 경우에는 사람이름의 첫글자를 프로필 이미지로 띄우도록 설정하였습니다.

```
import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  url: String,
});

useVirtualId(userSchema);
const User = Mongoose.model('User', userSchema);

export async function findByUsername(username) {
  return User.findOne({ username });
}

export async function findById(id) {
  return User.findById(id);
}

export async function createUser(user) {
  return new User(user).save().then((data) => data.id);
}
```

  + MyTweets
MyTweets 탭에서 사용자가 작성한 트윗글들을 모두 볼 수 있습니다. 여기서도 내용의 수정과 삭제가 가능하며 변경된 내용들은 유효성 검사를 거치고 ALL Tweets에서 실시간으로 업로드 됩니다. 

|My Tweets|
|:-:|
|<img src="https://user-images.githubusercontent.com/86216960/148919875-09203515-8f30-4e9a-9e9e-03c9620e86ea.png" width="200" />|



```
const Tweets = memo(({ tweetService, username, addable }) => {
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState('');
  const history = useHistory();
  const { user } = useAuth();

  useEffect(() => {
    tweetService
      .getTweets(username)
      .then((tweets) => setTweets([...tweets]))
      .catch(onError);

    const stopSync = tweetService.onSync((tweet) => onCreated(tweet));
    return () => stopSync();
  }, [tweetService, username, user]);

  const onCreated = (tweet) => {
    setTweets((tweets) => [tweet, ...tweets]);
  };

  const onDelete = (tweetId) =>
    tweetService
      .deleteTweet(tweetId)
      .then(() =>
        setTweets((tweets) => tweets.filter((tweet) => tweet.id !== tweetId))
      )
      .catch((error) => setError(error.toString()));

  const onUpdate = (tweetId, text) =>
    tweetService
      .updateTweet(tweetId, text)
      .then((updated) =>
        setTweets((tweets) =>
          tweets.map((item) => (item.id === updated.id ? updated : item))
        )
      )
      .catch((error) => error.toString());

  const onUsernameClick = (tweet) => history.push(`/${tweet.username}`);

  const onError = (error) => {
    setError(error.toString());
    setTimeout(() => {
      setError('');
    }, 3000);
  };
```


