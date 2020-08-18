const fs = require('fs');
const os = require('os');
const converter = require('webp-converter');

module.exports = async(input, originalImageName) => {
  // write out the file
  const fileName = `${os.tmpdir()}/${originalImageName}`;
  const outFile = `${os.tmpdir()}/${originalImageName.split('.')[0]}.webp`;
  fs.writeFileSync(fileName, input);
  const result = await converter.cwebp(fileName, outFile, '');
  console.log(result);
  // read the output file back in
  return fs.readFileSync(outFile);
};
