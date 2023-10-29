const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
    try {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };
        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);

        console.log('Success! The Image with Watermark was created.');
        startApp();
    }
    catch(error){
        console.log('Something went wrong... Try again');
    }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    try {
        const image = await Jimp.read(inputFile);

        const watermark = await Jimp.read(watermarkFile);
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  
        image.composite(watermark, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);

        console.log('Success! The Image with Watermark was created.');
        startApp();
    }
    catch(error){
        console.log('Something went wrong... Try again');
    }
};

const prepareOutputFilename = (filename) => {
    const [ name, ext ] = filename.split('.');
    return `${name}-with-watermark.${ext}`;
}

  const startApp = async () => {

    // Ask if user is ready
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
      }]);
  
    // if answer is no, just quit the app
    if(!answer.start) process.exit();
  
    // ask about input file
    const inputOptions = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    }]);

    const inputFilePath = './img/' + inputOptions.inputImage;
    let inputFile = inputOptions.inputImage;

    // Ask if user want to adjist the image
    const adjImage = await inquirer.prompt([{
        name: 'adjustment',
        message: 'Do you want adjust your image before adding the watermark?',
        type: 'confirm'
      }]);
  
    // if answer is yes, ask about type of adjustment
    if(adjImage.adjustment) {
        const imageAdjustment = await inquirer.prompt ([{
            name: 'adjustmentType',
            type: 'list',
            choices: ['Make image brighter', 'Increase contrast', 'Make image b&w', 'Invert image'],
        }]);


        const image = await Jimp.read(inputFilePath);

        if(imageAdjustment.adjustmentType === 'Make image brighter') {
            image.brightness(0.3);
        } else if (imageAdjustment.adjustmentType === 'Increase contrast') {
            image.contrast(0.7);
        } else if (imageAdjustment.adjustmentType === 'Make image b&w') {
            image.greyscale();
        } else if (imageAdjustment.adjustmentType === 'Make image b&w') {
            image.invert();
        }

        image.write('./img/adj_' + inputOptions.inputImage);
        inputFile = 'adj_' + inputOptions.inputImage;
    }

    // ask about watermark type
    const watermarkOptions = await inquirer.prompt([{
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark'],
      }]);
  
    if(watermarkOptions.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
          name: 'value',
          type: 'input',
          message: 'Type your watermark text:',
        }]);
        watermarkOptions.watermarkText = text.value;

        const inputPath = './img/' + inputOptions.inputImage;
        if(fs.existsSync(inputPath)) {
            addTextWatermarkToImage('./img/' + inputFile, './img/' + prepareOutputFilename(inputOptions.inputImage), watermarkOptions.watermarkText, 0.3);
        } else {console.log('Something went wrong... Try again')};
    }
      else {
        const image = await inquirer.prompt([{
          name: 'filename',
          type: 'input',
          message: 'Type your watermark name:',
          default: 'logo.png',
        }]);
        watermarkOptions.watermarkImage = image.filename;

        const inputPath = './img/' + inputOptions.inputImage;
        const watermarkPath = './img/' + watermarkOptions.watermarkImage;
        if(fs.existsSync(inputPath) && fs.existsSync(watermarkPath)) {
            addImageWatermarkToImage('./img/' + inputFile, './img/' + prepareOutputFilename(inputOptions.inputImage), './img/' + watermarkOptions.watermarkImage);
        } else {console.log('Something went wrong... Try again')};
    }
  }
  
  startApp();