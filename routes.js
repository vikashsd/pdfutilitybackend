
var express = require("express");
var annotPdf = require("annotpdf")

var router = express.Router();

router.get("/", function(req, res) {
   // console.log("hello I'm on the start page");
   res.render("index",{annotPdf:annotPdf});
   });

module.exports = router;