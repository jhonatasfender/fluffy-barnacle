const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const multer = require('multer');
const app = express();

const directory = 'C:\\Users\\jonatas.rodrigues\\Downloads\\EDU_FPOVAR_19\\unidade_1\\ebook\\sections'
const listSvg = []

app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + Math.random().toString(36).slice(-5))
  }
})

var upload = multer({
  storage: storage
})

app.get('/', (request, response) => {
  response.render('index.ejs', {
    svg: listSvg
  });
})

app.post('/upload-file', upload.array('file', 12), (request, response) => {
  for (const file of request.files) {
    fs.readFile(file.path, "utf8", (err, data) => {
      if (err) return console.log(err)
      const split = data.match(/data:image(.*?)("|\&quot\;)/g)
      if (split) {
        let count = 0
        for (const svg of split) {
          let a = {
            originalname: file.originalname,
            filename: file.filename,
            count: count += 1
          };
          if (svg.indexOf('&quot;') === -1) {
            a.img = svg.substring(0, svg.length - 1)
          } else {
            a.img = svg.replace('&quot;', '')
          }
          listSvg.push(a)
        }
      }
    });
  }

  response.redirect('/')
})

app.post('/replace', (request, response) => {
  const chunks = [];
  request.on('data', chunk => chunks.push(chunk));
  request.on('end', () => {
    const file = [];
    let count = 0;
    for (const line of chunks.toString().split( '\n' )) {
      let separetor = line.split(/[\[\]]/);
      if(!file[count] && !file[count].namefile) {
        file[count] = {
          namefile: separetor[1],
          data: []
        }
      }
    }
    // files[file-1559468328564-t2r7i][1][link]=\r
    // files[file-1559468328564-t2r7i][1][img]=data
    debugger
  })
})

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'))
})