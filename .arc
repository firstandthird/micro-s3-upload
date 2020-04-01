@app
micro-s3-upload

@static
folder public

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
s3-access

@logSubscription
function LambdaSlackHandler
filter ?error ?notice ?timeout ?"timed out"
retention 14
