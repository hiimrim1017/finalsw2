const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");

const PORT = 3900;

const app = express();

app.use(express.static('files'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post('/upload',
    fileUpload({ createParentPath: true}),
    (req, res) => {
        let files = req.files.myFiles;
        console.log(files);

        const fileNames = [];

        if (!Array.isArray(files)) {
            files = [files];
        }

        files.forEach(file => {
            const filepath = path.join(__dirname, 'files', file.name);
            file.mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err });
            });
            fileNames.push(file.name);
        });

        return res.json({ status: 'success', message: fileNames.join(', ') });
    }
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
