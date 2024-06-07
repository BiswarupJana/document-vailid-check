'use client'
import React, { useEffect, useRef, useState } from 'react';
import cv from '@techstark/opencv-js';

// DocumentDisplay is a React functional component that takes an 'image' prop
// The 'image' prop is a URL or data URL of an image
function DocumentDisplay({ image }) {
 // Create a reference to the canvas element using the useRef hook
 const canvasRef = useRef(null);
 // Create a state variable 'result' to store the detected document type, and a function 'setResult' to update it
 const [result, setResult] = useState('unknown');

 // Use the useEffect hook to execute code when the component mounts or the 'image' prop changes
 useEffect(() => {
  //inicjalizacja OpenCV
  cv.onRuntimeInitialized = () => {
   // Create a new Image object
   const img = new Image();
   // Set the source of the Image object to the 'image' prop
   img.src = image;
   // When the image is loaded, execute the callback function
   img.onload = () => {
     // Get the canvas element from the ref
     const canvas = canvasRef.current;
     // Get the 2D rendering context of the canvas
     const ctx = canvas.getContext('2d');
     // Set the width and height of the canvas to match the image dimensions
     canvas.width = img.width;
     canvas.height = img.height;
     // Draw the image on the canvas
     ctx.drawImage(img, 0, 0);
     // Call the identifyDocumentType function with the canvas and its rendering context
     identifyDocumentType(canvas, ctx);
   };
  };
 }, [image]);

 // Function to identify the document type in the input image
 const identifyDocumentType = (canvas, ctx) => {
   // Create a new img element
   const imgElement = document.createElement('img');
   // Set the source of the img element to the data URL of the canvas
   imgElement.src = canvas.toDataURL();
   console.log("Getting Input Image");
   // When the img element is loaded, execute the callback function
   imgElement.onload = function () {
     // Convert the img element to an OpenCV Mat object
     const src = cv.imread(imgElement);

     // Define the target size for resizing the input image
     const targetSize = { width: 300, height: 200 };

     // Create a new Mat object to store the resized input image
     let resizedSrc = new cv.Mat();
     // Resize the input image to the target size using cv.resize
     cv.resize(src, resizedSrc, new cv.Size(targetSize.width, targetSize.height), 0, 0, cv.INTER_AREA);

     // Define an array of template images and their names for document types
     const templates = [
       { name: 'Aadhaar', src: 'templates/aadhaar_template.png' },
       { name: 'PAN', src: 'templates/pan_template.png' },
     ];

     // Initialize a variable to store the best match and its maximum correlation value
     let bestMatch = { name: 'Unknown', maxVal: 0 };

     // Variable to keep track of completed template matches
     let completed = 0;

     // Iterate over each template image
     templates.forEach(template => {
       // Create a new img element for the template image
       const templateImg = document.createElement('img');
       // Set the source of the img element to the template image path
       templateImg.src = template.src;
       // When the img element is loaded, execute the callback function
       templateImg.onload = function () {
         // Convert the template img element to an OpenCV Mat object
         const tmpl = cv.imread(templateImg);

         // Create a new Mat object to store the resized template image
         let resizedTmpl = new cv.Mat();
         // Resize the template image to the target size using cv.resize
         cv.resize(tmpl, resizedTmpl, new cv.Size(targetSize.width, targetSize.height), 0, 0, cv.INTER_AREA);

         // Create new Mat objects for storing the result and mask of template matching
         const dst = new cv.Mat();
         const mask = new cv.Mat();

         // Perform template matching between the resized input image and resized template image using cv.matchTemplate
         cv.matchTemplate(resizedSrc, resizedTmpl, dst, cv.TM_CCOEFF, mask);
         // Get the minimum and maximum correlation values and their locations using cv.minMaxLoc
         let minMax = cv.minMaxLoc(dst);
         // Store the maximum correlation value
         let maxVal = minMax.maxVal;

         // If the maximum correlation value is greater than the current best match, update the bestMatch object
         if (maxVal > bestMatch.maxVal) {
           bestMatch = { name: template.name, maxVal };
         }

         // Delete the Mat objects to free up memory
         tmpl.delete();
         resizedTmpl.delete();
         dst.delete();
         mask.delete();

         // Increment the completed counter
         completed += 1;
         // If all template matches are completed
         if (completed === templates.length) {
           // Set the 'result' state with the detected document type
           setResult(`Detected Document: ${bestMatch.name}`);
           // Delete the resizedSrc Mat object
           resizedSrc.delete();
         }
       };
     });

     // Delete the src Mat object
     src.delete();
   };
 };

 // Render the component
 return (
   <div>
     {/* Render the canvas element with the ref */}
     <canvas ref={canvasRef}></canvas>
     {/* Display the detected document type */}
     <h1>{result}</h1>
   </div>
 );
}

// Export the DocumentDisplay component
export default DocumentDisplay;