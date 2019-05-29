const express = require('express');
const app = express();
const fs = require('fs');

const directory = 'C:\\Users\\jonatas.rodrigues\\Downloads\\EDU_FPOVAR_19\\unidade_1\\ebook\\sections'

app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function (request, response) {
  var listSvg = []
  fs.readdirSync('C:\\Users\\jonatas.rodrigues\\Downloads\\EDU_FPOVAR_19\\unidade_1\\ebook\\sections').forEach(file => {
    if (file.indexOf('html') != -1) {
      let content = fs.readFileSync(directory + '\\' + file).toString()
      let split = content.match(/data:image(.*)\"/g)
      if (split) {
        for (const svg of split) {
          listSvg.push(svg.substring(0,svg.length - 1))
        }
      }
    }
  });

  response.render('index.ejs', {
    svg: listSvg
  });
})

app.listen(app.get('port'), function () {
  console.log("Node app is running at localhost:" + app.get('port'))
})