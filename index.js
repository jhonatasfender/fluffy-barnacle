const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const multer = require('multer');
const app = express();

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

  if (listSvg.length) {
    response.redirect('/')
  }
})

app.post('/replace', (request, response) => {
  const chunks = [];

  request.on('data', chunk => chunks.push(chunk));

  request.on('end', () => {
    let list = [],
      count = 0,
      split_n = chunks.toString().split('\n');

    split_n.map((line, index, all) => {
      let struct = line.split(/[\[\]]+/);
      if (struct !== undefined && line.length && struct[4]) {
        if (list[count] === undefined) {
          list[count] = {
            fileName: struct[1],
            data: {}
          }
        }
        let removeCharacter = struct[4].toString().replace(/^=|\r$/g, '');

        list[count].data[struct[3]] = removeCharacter;

        let valid = list[count].data.link &&
          list[count].data.img &&
          list[count].data.originalname;

        valid && count++;
      }
    })

    if (split_n.length == list.length) {
      console.log(list, split_n.length)
    }
  })
})

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'))
})