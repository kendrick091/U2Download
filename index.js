import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
import ytdl from "ytdl-core";
import readline from "readline";
import fs from "fs";

let starttime

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

var app = express();
//view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, './views'))
// app.use(express.urlencoded(path.join(__dirname, './views')))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(flash());
// app.use(
//   session({
//     secret: "greencloud",
//     cookie: { maxAge: 60000 },
//     resave: false,
//     saveUninitialized: false,
//   }),
// );

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/form", function(req, res, next) {
    const videoLink = req.body.link;
    console.log(videoLink);
    download(videoLink, res);
});

async function download(videoLink, res) {
    let n = Math.floor(Math.random() * 10000);
    let url = videoLink;
    let videoID = ytdl.getVideoID(url);

    // var downloaded = 'C:/Users/user/Desktop/u2download_pwa/downloaded';
    var downloadVideo = "C:/Users/user/Downloads";
    var output = path.resolve(__dirname, downloadVideo, "video" + n + ".mp4");
    var video = ytdl(url);

    //Get info
    ytdl.getInfo(videoID).then((info) => {
        console.log("title: ", info.videoDetails.title);
        //pipe is a tool used for creating download function
        video.pipe(fs.createWriteStream(output));
        video.once("response", () => {
            starttime = Date.now();
        });
    });

    video.on("progress", (chankLength, downloaded, total) => {
        const precent = downloaded / total;
        const downloadMintes = (Date.now() - starttime) / 1000 / 60;
        const estimateDownloadTime = downloadMintes / precent - downloadMintes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(precent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(
            `${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB) \n`,
        );
        process.stdout.write(`running for: ${downloadMintes.toFixed(2)}minutes `);
        process.stdout.write(
            `estimated time left: ${estimateDownloadTime.toFixed(2)}minute `,
        );
        readline.moveCursor(process.stdout, 0, -1);
    });

    video.on("end", () => {
        process.stdout.write("\n\n");
        res.sendFile(path.join(__dirname, "index.html"));
    });
}

const port = 8880;
app.listen(port, () => console.log("server listen to ", port));