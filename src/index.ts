import {ImageObject} from './image-object';
import {ImageProcessingLAB} from './image-processingLAB';

const canvasIn = document.createElement('canvas');
document.body.appendChild(canvasIn);

const canvasOutLAB = document.createElement('canvas');
document.body.appendChild(canvasOutLAB);

const image = new ImageObject('assets/shirt.png');
image.loadListener((img) => {
    const contextIn = canvasIn.getContext('2d');
    contextIn.canvas.width = img.width;
    contextIn.canvas.height = img.height;
    contextIn.drawImage(img, 0, 0);

    //lab is better
    const imageProcessorLAB = new ImageProcessingLAB(contextIn);
    const allPixelsLAB = imageProcessorLAB.getAllPixels();
    const clustersLAB = imageProcessorLAB.getClusters();
    const contextOutLAB = canvasOutLAB.getContext('2d');
    contextOutLAB.canvas.width = img.width;
    contextOutLAB.canvas.height = img.height;
    console.log('clustersLAB', clustersLAB);
    for (let pixel of allPixelsLAB) {
        const cluster = clustersLAB[pixel.cluster];
        const initPixel = cluster[Math.floor(cluster.length/2)];
        contextOutLAB.fillStyle = `rgb(${initPixel.rgbData.r}, ${initPixel.rgbData.g}, ${initPixel.rgbData.b})`;
        contextOutLAB.fillRect(pixel.x, pixel.y, 1, 1);
    }
});