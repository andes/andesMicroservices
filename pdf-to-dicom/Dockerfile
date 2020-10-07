FROM darthunix/dcmtk
# Install git.
# Git is required for fetching the dependencies.
RUN apk update && apk add --no-cache git go musl-dev
WORKDIR $GOPATH/src/toolkit/http-pfd2dcm/
COPY . .
# Fetch dependencies.
# Using go get.
RUN go get -d -v
# Build the binary.
#ENV GOOS=linux
#ENV GOARCH=386
RUN go build -o /go/bin/main
EXPOSE 8080
ENTRYPOINT ["/go/bin/main"]