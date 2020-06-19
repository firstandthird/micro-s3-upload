const fs = require('fs');
const os = require('os');
const converter = require('webp-converter');

module.exports = async(input, originalImageName) => {
  // write out the file
  const fileName = `${os.tmpdir()}/${originalImageName}`;
  const outFile = `${os.tmpdir()}/${originalImageName.split('.')[0]}.webp`;
  fs.writeFileSync(fileName, input);
  // do the conversion (does not work with util.pomisify)
  await new Promise((accept, reject) => {
    converter.cwebp(fileName, outFile, '', (res, error) => {
      if (error) {
        return reject(error);
      }
      return accept(res);
    });
  });
  // read the output file back in
  return fs.readFileSync(outFile);
};
