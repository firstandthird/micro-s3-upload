/* eslint-disable no-console */
const fs = require('fs');
const pkg = require('../package.json');
const sam = require('../sam.json');

console.log('Using Version:', pkg.version);

sam.Metadata = {
  'AWS::ServerlessRepo::Application': {
    Name: pkg.name,
    Description: pkg.description,
    Author: pkg.author.replace('&', 'and'),
    SpdxLicenseId: pkg.license,
    LicenseUrl: './LICENSE',
    ReadmeUrl: './README.md',
    HomePageUrl: pkg.homepage,
    SemanticVersion: pkg.version,
    SourceCodeUrl: pkg.repository.url.replace('git+', '').replace('.git', `/tree/${pkg.version}`),
    Labels: ['upload', 's3']
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

// copy static assets
sam.Resources.CopyStaticAssets = {
  Type: 'AWS::Serverless::Function',
  DependsOn: [
    'StaticBucket',
    'Role'
  ],
  Properties: {
    Handler: 'index.handler',
    CodeUri: './scripts/copystatic',
    Runtime: 'nodejs12.x',
    MemorySize: 128,
    Timeout: 5,
    Environment: {
      Variables: {
        ARC_ROLE: {
          Ref: 'Role'
        },
        ARC_CLOUDFORMATION: {
          Ref: 'AWS::StackName'
        },
        ARC_APP_NAME: pkg.name,
        ARC_HTTP: 'aws_proxy',
        NODE_ENV: 'production',
        SESSION_TABLE_NAME: 'jwe',
        ARC_STATIC_BUCKET: {
          Ref: 'StaticBucket'
        },
        S3_BUCKET: {
          Ref: 'ArcS3Bucket'
        }
      }
    },
    Role: {
      'Fn::Sub': [
        'arn:aws:iam::${AWS::AccountId}:role/${roleName}',
        {
          roleName: {
            Ref: 'Role'
          }
        }
      ]
    },
  }
};

sam.Resources.InvokeCopyStaticAssets = {
  Type: 'AWS::CloudFormation::CustomResource',
  DependsOn: [
    'CopyStaticAssets'
  ],
  Properties: {
    ServiceToken: { 'Fn::GetAtt': ['CopyStaticAssets', 'Arn'] }
  }
};

console.log('Writing updated sam.json');
fs.writeFileSync('./sam.json', JSON.stringify(sam, null, 2), { flag: 'w' });
