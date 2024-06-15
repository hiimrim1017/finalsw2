const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3900;

// 업로드 디렉터리 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer 설정ㄴ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// 파일 업로드 엔드포인트
app.post('/upload', upload.array('images', 12), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ status: 'failed', message: 'No images uploaded.' });
  }

  const pdfPath = path.join(uploadDir, `${Date.now()}.pdf`);
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(pdfPath);

  doc.pipe(writeStream);

  req.files.forEach(file => {
    const filePath = file.path;
    if (fs.existsSync(filePath)) {
      doc.addPage().image(filePath, {
        fit: [500, 700],
        align: 'center',
        valign: 'center'
      });
      // 업로드된 이미지 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
    } else {
      console.error(`File not found: ${filePath}`);
    }
  });

  doc.end();

  writeStream.on('finish', () => {
    res.json({ status: 'success', message: 'PDF created.', downloadUrl: `http://localhost:${port}/uploads/${path.basename(pdfPath)}` });
  });
});

app.listen(port, () => {
  console.log(`PDF conversion server running on port ${port}`);
});
