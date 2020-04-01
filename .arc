@app
micro-s3-upload

@static
fingerprint true

@aws
region us-east-1
bucket micro-s3-upload
profile sgff

@http
get /
get /upload-single
get /upload-multi
post /signature
get /media/:image

@macros
arc-macro-lambda-slack
arc-macro-log-subscription
arc-s3-bucket

@logSubscription
function LambdaSlackHandler
filter ?error ?notice ?timeout ?"timed out"
retention 14

@s3
