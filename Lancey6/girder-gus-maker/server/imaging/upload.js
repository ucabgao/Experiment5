import chalk from 'chalk';
import Promise from 'bluebird';
import s3 from 's3';

var env = require('../env');

const client = s3.createClient({
  s3Options: {
    accessKeyId: env.S3.ACCESS_KEY_ID,
    secretAccessKey: env.S3.SECRET_ACCESS_KEY
  }
});

function uploadMapThumb(imagePath, levelId) {

  const params = {
    localFile: imagePath,
    s3Params: {
      Bucket: "girder-gus",
      Key: levelId + ".png"
    },
  };

  const uploader = client.uploadFile(params);

  return new Promise( (resolve, reject) => {
    uploader.on('error', function(err) {
      console.error("unable to upload:", JSON.stringify( err ));
      console.error(err.stack);
      reject(err);
    });
    uploader.on('end', function() {
      console.log(chalk.green("Canvas data uploaded to S3."));
      console.log("Removing local copy...");
      resolve();
    });
  } )

}

module.exports = uploadMapThumb;
