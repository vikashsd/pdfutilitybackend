//const url = 'https://jobdepot-c-dev-ed.develop.my.salesforce.com/sfc/servlet.shepherd/document/download/0695g00000A2IlEAAV';
const url ='./assets/pdfs/test.pdf'
let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null,
  pdfFactory = undefined,
  pdfViewer = undefined,
  coordinates = [];

let setStatus = function (value) {
        document.getElementById("statusLine").innerHTML = " " + value + " "

        document.getElementById("annotationCount").innerHTML = " " + (pdfFactory.getAnnotationCount() + 1) + " "
}

let updateCoordinates = function () {
        let _str = coordinates.map((x) => Math.round(x)).join(",")
        document.getElementById("coords").innerHTML = _str
}


let getParameters = function () {

        let content = document.getElementById("content").value
        let author = document.getElementById("author").value

        let x = coordinates[0]
        let y = coordinates[1]

        return [x, y, content, author]
}

let selectionCoordinates = function () {
        let rec = window.getSelection().getRangeAt(0).getBoundingClientRect()
        let ost = computePageOffset()
        let x_1 = rec.x - ost.left
        let y_1 = rec.y - ost.top
        let x_2 = x_1 + rec.width
        let y_2 = y_1 + rec.height

        let x_1_y_1 = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x_1, y_1)
        x_1 = x_1_y_1[0]
        y_1 = x_1_y_1[1]
        let x_2_y_2 = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x_2, y_2)
        x_2 = x_2_y_2[0]
        y_2 = x_2_y_2[1]
        return [x_1, y_1, x_2, y_2]
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.0.943/build/pdf.worker.min.js'

let computePageOffset = function () {
        let pageId = "page" + pdfViewer.currentPageNumber
        let pg = document.getElementById(pageId)

        var rect = pg.getBoundingClientRect(), bodyElt = document.body;
        return {
                top: rect.top + bodyElt .scrollTop,
                left: rect.left + bodyElt .scrollLeft
        }
}

window.onload =  function(){
  document.getElementById("content").value = "";
  document.getElementById("author").value = "";
  let pdfContainer = document.getElementById('viewerContainer')

  pdfViewer = new pdfjsViewer.PDFViewer({
          container : pdfContainer
  })
  let loadingTask = pdfjsLib.getDocument({
    url : url
})
pdfContainer.addEventListener('click', (evt) => {
  let ost = computePageOffset()
  let x = evt.pageX - ost.left
  let y = evt.pageY - ost.top
  console.log(x)
  console.log(y)

  let x_y = pdfViewer._pages[pdfViewer.currentPageNumber - 1].viewport.convertToPdfPoint(x, y)
  x = x_y[0]
  y = x_y[1]

  coordinates.push(x) 
  coordinates.push(y)

  updateCoordinates()
  
  document.querySelector('#clear').addEventListener('click', (evt) => {
                coordinates = []
                updateCoordinates()
        })
  document.querySelector('#addTextAnnotation').addEventListener('click', (evt) => {
        setStatus("Added Text Annotation")
        let parameters = getParameters()
        pdfFactory.createTextAnnotation(pdfViewer.currentPageNumber - 1, [parameters[0], parameters[1], parameters[0] + 22, parameters[1] + 22], parameters[2], parameters[3])
        coordinates = []
        updateCoordinates()
   })
   document.querySelector('#addHighlightAnnotation').addEventListener('click', (evt) => {
        setStatus("Added Highlight Annotation")
        let parameters = getParameters()
        pdfFactory.createHighlightAnnotation(pdfViewer.currentPageNumber - 1, selectionCoordinates(), parameters[2], parameters[3])
        coordinates = []
        updateCoordinates()
})
document.querySelector('#addUnderlineAnnotation').addEventListener('click', (evt) => {
        setStatus("Added Underline Annotation")
        let parameters = getParameters()
        pdfFactory.createUnderlineAnnotation(pdfViewer.currentPageNumber - 1, selectionCoordinates(), parameters[2], parameters[3], {r : 0, g : 0, b : 0})
        coordinates = []
        updateCoordinates()
})
        document.querySelector('#download').addEventListener('click', (evt) => {
                setStatus("Download")
                pdfFactory.download("sample.pdf")
        })
  if (doCircle) {
          setStatus("Select the second point")

          if (coordinates.length == 4) {
                  setStatus("Added circle annotation")
                  doCircle = false
                  let parameters = getParameters()
                  pdfFactory.createCircleAnnotation(pdfViewer.currentPageNumber - 1, coordinates.slice(), parameters[2], parameters[3])

                  coordinates = []
          }
        }

  if (doSquare) {
          setStatus("Select the second point")

          if (coordinates.length == 4) {
                  setStatus("Added square annotation")
                  doCircle = false
                  let parameters = getParameters()
                  pdfFactory.createSquareAnnotation(pdfViewer.currentPageNumber - 1, coordinates.slice(), parameters[2], parameters[3])

                  coordinates = []
          }
        }
})
loadingTask.promise.then((pdfDocument) => {
    pdfDocument.getData().then((data) => {
            pdfFactory = new pdfAnnotate.AnnotationFactory(data)
    })
    pdfViewer.setDocument(pdfDocument)
    setTimeout(() => {
            pdfViewer.currentScaleValue = 'page-width'
    }, 1500)
})
}
// Get Document
// pdfjsLib
//   .getDocument(url)
//   .promise.then(pdfDoc_ => {
//     pdfDoc = pdfDoc_;

//     document.querySelector('#page-count').textContent = pdfDoc.numPages;

//     renderPage(pageNum);
//   })
//   .catch(err => {
//     // Display error
//     const div = document.createElement('div');
//     div.className = 'error';
//     div.appendChild(document.createTextNode(err.message));
//     document.querySelector('body').insertBefore(div, canvas);
//     // Remove top bar
//     document.querySelector('.top-bar').style.display = 'none';
//   });

// Button Events
// document.querySelector('#prev-page').addEventListener('click', showPrevPage);
// document.querySelector('#next-page').addEventListener('click', showNextPage);
