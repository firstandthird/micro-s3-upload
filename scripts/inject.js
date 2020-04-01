/* eslint-disable no-console */
const fs = require('fs');
const pkg = require('../package.json');
const sam = require('../sam.json');

console.log('Using Version:', pkg.version);

sam.Metadata = {
  'AWS::ServerlessRepo::Application': {
    Name: 'pagedata-api',
    Description: pkg.description,
    Author: pkg.author.replace('&', 'and'),
    SpdxLicenseId: pkg.license,
    LicenseUrl: './LICENSE',
    ReadmeUrl: './README.md',
    HomePageUrl: pkg.homepage,
    SemanticVersion: pkg.version,
    SourceCodeUrl: pkg.repository.url.replace('git+', '').replace('.git', `/tree/${pkg.version}`),
    Labels: ['pagedata']
  }
};

sam.Parameters = {
};

// Iterate over generated resources and inject environment refs
Object.values(sam.Resources).forEach(resource => {
  if (resource.Type !== 'AWS::Serverless::Function') {
    return;
  }

  Object.keys(sam.Parameters).forEach(paramName => {
    if (!sam.Parameters[paramName].__name) {
      console.warn(`__name not set for ${paramName}`);
      return;
    }

    resource.Properties.Environment.Variables[sam.Parameters[paramName].__name] = {
      Ref: paramName
    };
  });
});


Object.keys(sam.Parameters).forEach(paramName => {
  // We don't want this to end up in the template
  delete sam.Parameters[paramName].__name;
});

console.log('Writing updated sam.json');
fs.writeFileSync('./sam.json', JSON.stringify(sam, null, 2), { flag: 'w' });
