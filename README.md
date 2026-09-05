# My Snake Game

เว็บเกมงูเรืองแสงที่สร้างด้วย HTML + CSS + JavaScript Canvas

## คุณสมบัติ

- Start Game
- งู + อาหาร
- Score +1 และงูยาวขึ้น เมื่อกินอาหาร
- งูห้ามชนกำแพงหรือชนตัวเอง
- Game Over
- Final Score
- Restart / Play Again
- (Delta Time) มาควบคุมความเร็วของงูผ่านตัวแปร
- ควบคุมด้วย กดปุ่มลูกศรซ้าย-ขวา-บน-ล่าง และกด Spacebar เพื่อหยุดเกมชั่วคราว
- รองรับ Arrow Left / Arrow Right
- การสัมผัส (Touch): ตรวจจับการปัดหน้าจอ (Swipe) ขึ้นลงซ้ายขวาบนพื้นที่เล่นสำหรับหน้าจอมือถือ
- ไม่ต้องติดตั้ง Python หรือ Pygame

## โครงสร้าง

- index.html
- game.js
- style.css

## ทดสอบในเครื่อง

เปิด `index.html` ด้วย Chrome ได้เลย

หรือใช้ VS Code + Live Server

## นำขึ้น GitHub Pages

สร้าง GitHub repository เช่น `my-ball-game`

อัปโหลดทั้ง 3 ไฟล์ไว้ที่ root:

- index.html
- game.js
- style.css

จากนั้นไปที่:

Repository -> Settings -> Pages

เลือก:

- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

กด Save

URL จะมีรูปแบบ:

https://YOUR-USERNAME.github.io/my-Snake-game/
