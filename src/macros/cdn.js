module.exports = function(arc, cloudformation, stage) {
  cloudformation.Resources.ImageHandlerDistribution = {
    Type: 'AWS::CloudFront::Distribution',
    Properties: {
      DistributionConfig: {
        Origins: [{
          DomainName: { 'Fn::Sub': '${MicroS3Upload}.execute-api.${AWS::Region}.amazonaws.com' },
          Id: { Ref: 'MicroS3Upload' },
          OriginPath: '/media',
          CustomOriginConfig: {
            HTTPSPort: 443,
            OriginProtocolPolicy: 'https-only',
            OriginSSLProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2']
          }
        }],
        Enabled: true,
        HttpVersion: 'http2',
        Comment: 'S3 Upload Image handler distribution',
        DefaultCacheBehavior: {
          AllowedMethods: ['GET', 'HEAD'],
          TargetOriginId: { 'Fn::Sub': '${MicroS3Upload}' },
          ForwardedValues: {
            QueryString: false,
            Headers: ['Origin', 'Accept'],
            Cookies: { Forward: 'none' }
          },
          ViewerProtocolPolicy: 'https-only'
        },
        CustomErrorResponses: [
          {
            ErrorCode: 500,
            ErrorCachingMinTTL: 10
          },
          {
            ErrorCode: 501,
            ErrorCachingMinTTL: 10
          },
          {
            ErrorCode: 502,
            ErrorCachingMinTTL: 10
          },
          {
            ErrorCode: 503,
            ErrorCachingMinTTL: 10
          },
          {
            ErrorCode: 504,
            ErrorCachingMinTTL: 10
          }
        ],
        PriceClass: 'PriceClass_All',
      }
    }
  };
  cloudformation.Outputs.mediaDistribution = {
    Description: 'Media endpoint',
    Value: {
      'Fn::Sub': 'https://${ImageHandlerDistribution.DomainName}'
    }
  };

  //console.log(JSON.stringify(cloudformation, null, 2));
  //throw new Error();
  return cloudformation;
};
