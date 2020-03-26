//TODO: make this just the bucket
module.exports = function(arc, cloudformation, stage) {
  cloudformation.Resources.Role.Properties.Policies.push({
    PolicyName: 'ArcS3Access',
    PolicyDocument: {
      Statement: [{
        Effect: 'Allow',
        Action: 's3:*',
        Resource: '*'
      }]
    }
  });
  return cloudformation;
};
