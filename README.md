# steam-todolist-backend
스팀 도전과제 투두 리스트 백엔드

## ERD
![ERD](https://github.com/PHJ-a/steam-todolist-backend/assets/156567892/dfbcee43-80b3-44ba-b976-5179ec47a7b5)

<br/>

## API 명세
### 로그인
- 설명: 로그인
- method: POST
- endpoint: /login
- Auth required: true
#### Request Body
- user_id: string - 스팀 유저 고유 아이디
#### Response 200
- token: string - JWT 토큰

### 투두리스트 목록 가져오기
- 설명: 유저의 투두리스트 목록을 가져온다
- method: GET
- endpoint: /todolists
- Auth required: true
#### Request Body
#### Response 200
```json
{
  "id": "number",
  "title": "string",
  "start_date": "Date",
  "end_date": "Date",
  "achievement_id": "number",
}
```

### 게임 목록 가져오기
- 설명: 유저가 가진 게임 목록을 가져온다
- method: GET
- endpoint: /games
- Auth required: true
#### Request Body
#### Response 200
```json
{
  "games": {
    "id": "number",
    "title": "string"
  },
  "pagination": {
    "total_count": "number",
    "page": "number",
    "page_list_count": "number"
  }
}
```

### 도전 과제 목록 가져오기
- 설명: 해당 유저와 게임의 도전 과제 목록을 가져온다 (완료한 도전과제 제외)
- method: GET
- endpoint: /achievements/{game_id}
- Auth required: true
#### Request Body
#### Response 200
```json
{
  "games": {
    "id": "number",
    "title": "string"
  },
  "pagination": {
    "total_count": "number",
    "page": "number",
    "page_list_count": "number"
  }
}
```

### 투두 만들기
- 설명: 투두를 만든다
- method: POST
- endpoint: /todolists
- Auth required: true
#### Request Body
```json
{
  "game_id": "number",
  "achievement_id": "number",
  "start_date": "Date"
}
```
#### Response 201

### 투두 삭제
- 설명: 투두를 삭제한다
- method: DELETE
- endpoint: /todolists/{id}
- Auth required: true
#### Request Url Params
```json
  {
    "id": "number"
  }
```
#### Response 200

### 투두 수정
- 설명: 투두를 수정한다
- method: PUT
- endpoint: /todolists/{id}
- Auth required: true
#### Request Url Params
```json
{
  "id": "number"
}
```
#### Request Body
```json
{
  "game_id": "number",
  "achievement_id": "number",
  "start_date": "Date"
}
```
#### Response 200
