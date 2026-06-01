// ─────────────────────────────────────────────────────────
//  네이버 메일 자동 발송 서버
//  - 받는 사람 이메일을 받아서, 정해진 내용의 메일을 보냅니다.
// ─────────────────────────────────────────────────────────

require('dotenv').config();           // .env 파일에서 비밀번호 등을 읽어옴
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// ─────────────────────────────────────────────────────────
//  대시보드(web.app)에서 이 서버를 부를 수 있게 출입 허가(CORS)
//  → 대시보드 주소가 바뀌면 아래 목록만 고치면 됩니다.
// ─────────────────────────────────────────────────────────
const ALLOWED = [
  'https://ffff-2df58.web.app',
  'http://localhost:3000',          // 내 컴퓨터에서 테스트할 때
];
app.use(cors({ origin: ALLOWED }));

app.use(express.json());              // 웹페이지가 보낸 데이터를 읽기 위한 설정
app.use(express.static('public'));    // (테스트용) public 폴더의 웹페이지도 보여줌

// ─────────────────────────────────────────────────────────
//  ① 네이버웍스(NAVER WORKS) 메일 연결 설정
//     (아이디/비밀번호는 .env 파일에서 가져오므로 여기엔 안 적어요)
//
//     ※ 587 로 안 되면 아래 두 줄을 바꿔보세요:
//          port: 465,
//          secure: true,
// ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.worksmobile.com',       // 네이버웍스 발송 서버
  port: 587,
  secure: false,                      // 587 은 STARTTLS 방식 (false 가 맞아요)
  auth: {
    user: process.env.WORKS_USER,     // 내 네이버웍스 메일 전체 주소 (예: name@회사도메인)
    pass: process.env.WORKS_PASS,     // 네이버웍스 비밀번호
  },
});

// ─────────────────────────────────────────────────────────
//  ② 보낼 메일의 "정해진 내용" — 여기만 고치면 내용이 바뀝니다.
// ─────────────────────────────────────────────────────────
const MAIL_SUBJECT = '오아주식회사에서 보내드립니다';   // 메일 제목

const MAIL_HTML = `
  <div style="font-family: 'Pretendard', sans-serif; line-height: 1.7; color: #222;">
    <p>안녕하세요,</p>
    <p>오아주식회사입니다.</p>
    <p>여기에 매번 보낼 내용을 적으세요.<br>
       줄을 바꾸고 싶으면 &lt;br&gt; 을 넣으면 됩니다.</p>
    <p>감사합니다.</p>
  </div>
`;

// ─────────────────────────────────────────────────────────
//  ③ 웹페이지의 "보내기" 버튼이 눌리면 이 부분이 실행됨
// ─────────────────────────────────────────────────────────
app.post('/send', async (req, res) => {
  const to = (req.body.to || '').trim();

  // 이메일을 안 넣었거나 형식이 이상하면 거절
  if (!to || !to.includes('@')) {
    return res.json({ ok: false, message: '받는 사람 이메일을 올바르게 입력하세요.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.WORKS_USER,   // 보내는 사람 = 로그인 계정 (★반드시 같아야 함)
      to: to,                         // 받는 사람
      subject: MAIL_SUBJECT,
      html: MAIL_HTML,
    });
    res.json({ ok: true, message: to + ' 님에게 메일을 보냈어요!' });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, message: '발송 실패: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────
//  ④ 서버 켜기
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
//  ④ 서버 켜기
//     (Render 같은 곳에 올리면 포트를 자동으로 정해줘요)
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('────────────────────────────────────────');
  console.log('  메일 발송 서버가 켜졌어요! (포트 ' + PORT + ')');
  console.log('  내 컴퓨터에서 테스트: http://localhost:' + PORT);
  console.log('────────────────────────────────────────');
});
