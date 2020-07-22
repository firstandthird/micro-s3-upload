@app
micro-s3-upload

@static
fingerprint true

@aws
region us-east-1
profile sgff

@cdn false

@http
get /
get /upload-single
get /upload-multi
post /signature
get /media/:image

@macros
architect/macro-http-api
arc-macro-lambda-slack
arc-macro-log-subscription
arc-s3-bucket
cdn

@logSubscription
function LambdaSlackHandler
filter ?error ?notice ?timeout ?"timed out"
retention 14

@s3
cors

@sarStatic
