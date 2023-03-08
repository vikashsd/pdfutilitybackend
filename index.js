var express = require('express')
var bodyParser = require('body-parser');
var http = require('http')
//var annotpdf = require('annotpdf')
var fs = require('fs')
var PDFDocument = require('pdfkit')
var jsforce = require('jsforce')
var app = express()
const PDFMerger = require('pdf-merger-js');
const merger = new PDFMerger();
const Request = require('request');
const { Console } = require('console');
const cors = require('cors');
const multer = require('multer');

const FILENAME = 'sample.pdf'
const FILEURL = "./assets/pdfs/sample.pdf"
const PUBLIC_URL = '/public'
//var pdfFactory = new annotpdf.AnnotationFactory()
app.use(bodyParser.urlencoded({ extend: true }));
app.set('port', (process.env.PORT || 5000))
app.use('/assets', express.static('assets'))
app.use('/uploads', express.static('uploads'));
app.use('/pdfs', express.static('pdfs'));

app.use(cors());


app.engine('html', require('ejs').renderFile);
const HOST = 'https://jobdepot-c-dev-ed.develop.my.salesforce.com'

var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl: HOST
});

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('userDoc');


conn.login('abhinav.anvikar@sandbox.in', 'Tillu@1990k62ckdLzZtD0uEsdaDjCobEn', (err, userInfo) => {
  if (err) {
    console.error(err)
  }
  else {
    console.log(userInfo)
  }
})



app.post('/upload',function(req,res){
  upload(req,res,function(err) {
      if(err) {
          return res.end("Error uploading file.");
      }
      fs.createWriteStream(`./uploads/upload.pdf`,req.userDoc);

      fs.readFile("./uploads/upload.pdf", (err, pdfBuffer) => {
        console.log(pdfBuffer)
        conn
        .sobject("ContentVersion").create(
            {
              PathOnClient: "upload.pdf",
              VersionData: pdfBuffer?.toString("base64"),
            },
            function (err, ret) {
              if (err || !ret.success) {
                return console.error(err, ret);
              }
              console.log("Created record id : " + ret.id);
              // response.send({ success: ret.id });
            }
          );
      });
      res.end("File is uploaded");
  });
});

app.get('/merge', async (request, response) => {
  const query = "select ContentDocument.Id, ContentDocument.Title from ContentDocument where Title like 'test%'";
  conn.query(query, async (err, result) => {
    if (err) {
      response.send(err)
    } else {
      try {
        console.log('result', result);
        let idsArray = [];
        let versionDataIds = [];
        for (let i = 0; i < result.records.length; i++) {
          idsArray.push(result.records[i].Id)
        }
        idsArray = idsArray.map(id => `'${id}'`)

        let myQuery = "select versionData from ContentVersion where ContentDocumentId IN (" + idsArray.join(", ") + ")";
        conn.query(myQuery, async (err, res) => {
          if (err) {
            res.send(err)
          } else {
            versionDataIds = res.records.map(record => {
              const sss = record.VersionData.split("/ContentVersion/")[1];
              return sss.replace('/VersionData', '');
            })


            // downloading files
            let count = 0;
            console.log('versionDataIds', versionDataIds)
            for (let k = 0; k < versionDataIds.length; k++) {
              conn.request(`/services/data/v42.0/sobjects/ContentDocument/` + versionDataIds[k] + `/VersionData`)
              let fileOut = fs.createWriteStream(`./pdfs/file_test_${k + 2}.pdf`)
              const l = conn.sobject("ContentVersion").record(versionDataIds[k]).blob('VersionData').pipe(fileOut);
              l.on('close', () => {
                count++;
                if (count === versionDataIds.length) {
                  
                  // merge files
                  (async () => {
                    for (let i = 2; i <= 4; i++) {
                      await merger.add(`./pdfs/file_test_${i}.pdf`)
                    }
                    await merger.save('./uploads/merged.pdf')
                   
                    // Upload the merged file back
                    fs.readFile("./uploads/merged.pdf", (err, pdfBuffer) => {
                      conn
                      .sobject("ContentVersion").create(
                          {
                            PathOnClient: "_james_bond.pdf",
                            VersionData: pdfBuffer.toString("base64"),
                          },
                          function (err, ret) {
                            if (err || !ret.success) {
                              return console.error(err, ret);
                            }
                            console.log("Created record id : " + ret.id);
                            // response.send({ success: ret.id });
                          }
                        );
                    });
                    response.send("<a href='/uploads/merged.pdf'>Click here</a>")
                  })()
                }
              })
            }
          }
        })
      } catch (e) {
        response.send(e)
      }
    }
  })
})


app.get('/getDocument', async (request, response) => {
  let documentName = JSON.parse(request.query.documentName);
  console.log(documentName)
  const query = `SELECT ContentDocument.Id, ContentDocument.Title FROM ContentDocument WHERE Title = '${documentName}'`;
  conn.query(query, async (err, result) => {
    if (err) {
      response.send(err)
    } else {
      try {
        console.log('result', result);
        let idsArray = [];
        let versionDataIds = [];
        for (let i = 0; i < result.records.length; i++) {
          idsArray.push(result.records[i].Id)
        }
        idsArray = idsArray.map(id => `'${id}'`)

        let myQuery = "select versionData from ContentVersion where ContentDocumentId IN (" + idsArray.join(", ") + ")";
        conn.query(myQuery, async (err, res) => {
          if (err) {
            res.send(err)
          } else {
            versionDataIds = res.records.map(record => {
              const sss = record.VersionData.split("/ContentVersion/")[1];
              return sss.replace('/VersionData', '');
            })

            // downloading files
            let count = 0;
            console.log('versionDataIds', versionDataIds)
            for (let k = 0; k < versionDataIds.length; k++) {
              conn.request(`/services/data/v42.0/sobjects/ContentDocument/` + versionDataIds[k] + `/VersionData`)
              let fileOut = fs.createWriteStream(`./pdfs/test.pdf`);
              const l = conn.sobject("ContentVersion").record(versionDataIds[k]).blob('VersionData').pipe(fileOut);
            }
            l.on('close', () => {
              response.send(`/pdfs/${documentName}.pdf`)
            })
            
           
          }
        })
      } catch (e) {
        response.send(e)
      }
    }
  })
})





app.listen(app.get('port'), function () {
  console.log("Node app is running at localhost:" + app.get('port'))
})