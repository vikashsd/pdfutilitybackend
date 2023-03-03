//const url = 'https://jobdepot-c-dev-ed.develop.my.salesforce.com/sfc/servlet.shepherd/document/download/0695g00000A2IlEAAV';

const url ='./assets/pdfs/sample.pdf'
let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

// const scale = 1.5,
//   canvas = document.querySelector('#pdf-render'),
//   ctx = canvas.getContext('2d');

// Render the page
// const renderPage = num => {
//   pageIsRendering = true;

//   // Get page
//   pdfDoc.getPage(num).then(page => {
//     // Set scale
//     const viewport = page.getViewport({ scale });
//     canvas.height = viewport.height;
//     canvas.width = viewport.width;

//     const renderCtx = {
//       canvasContext: ctx,
//       viewport
//     };

//     page.render(renderCtx).promise.then(() => {
//       pageIsRendering = false;

//       if (pageNumIsPending !== null) {
//         renderPage(pageNumIsPending);
//         pageNumIsPending = null;
//       }
//     });

//     // Output current page
//     document.querySelector('#page-num').textContent = num;
//   });
// };

// Check for pages rendering
// const queueRenderPage = num => {
//   if (pageIsRendering) {
//     pageNumIsPending = num;
//   } else {
//     renderPage(num);
//   }
// };

// Show Prev Page
// const showPrevPage = () => {
//   if (pageNum <= 1) {
//     return;
//   }
//   pageNum--;
//   queueRenderPage(pageNum);
// };

// Show Next Page
// const showNextPage = () => {
//   if (pageNum >= pdfDoc.numPages) {
//     return;
//   }
//   pageNum++;
//   queueRenderPage(pageNum);
// };

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.0.943/build/pdf.worker.min.js'

window.onload =  function(){
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
