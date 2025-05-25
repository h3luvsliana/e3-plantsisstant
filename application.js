// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/j2pZ9CNMf/";

let model, maxPredictions, likelyInstructions;
let predictWait = 2000;
let likelyImageNode;
let likelyProbabilityNode;
let imageInput;
let inputCanvas;
let drawingContext;
let weedClasses = ['dandelion', 'thistle', 'shot-weed'];
let initialized = false;

async function addPhoto() {
    await initialize();
    imageInput.click();
}

async function initialize() {
    if (initialized) {
        return true;
    }
    inputCanvas = document.getElementById('receiveImage');
    imageInput = document.getElementById('imageInput');
    drawingContext = inputCanvas.getContext('2d');
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
  
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Set canvas size to match the image
            inputCanvas.width = img.width;
            inputCanvas.height = img.height;
  
            // Draw the image on the canvas
            drawingContext.drawImage(img, 0, 0);
            predict();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    likelyImageNode = document.getElementById('most-likely-image');
    likelyProbabilityNode = document.getElementById('most-likely-probability');
    likelyInstructions = document.getElementById('infotext');

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    initialized = true;
}

function sort_probability(a,b) {
    return b.probability - a.probability;
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(inputCanvas);
    prediction.sort(sort_probability);
    let predictSlug = prediction[0].className.toLowerCase().replace(/\s/g, '-');
    likelyImageNode.src = "class-images/" + predictSlug + '.jpg';
    likelyProbabilityNode.innerHTML = prediction[0].className + ' ' + (prediction[0].probability * 100).toFixed(1) + '%';
    if (weedClasses.indexOf(predictSlug) > -1) {
        likelyInstructions.innerHTML = '<strong class="weed">WEED</strong>';
    } else {
        likelyInstructions.innerHTML = document.getElementById('data-' + predictSlug).innerHTML;
    }
    
    /*for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

    }*/
}