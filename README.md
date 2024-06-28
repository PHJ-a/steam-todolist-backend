# steam-todolist-backend
스팀 도전과제 투두 리스트 백엔드

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
- 설명: 로그인
- method: GET
- endpoint: /todolist
- Auth required: true
#### Request Body
#### Response 200
```json
{
  id: number,
  title: string,
  start_date: Date,
  end_date: Date | null,
  achievement_id: number,
}
```
