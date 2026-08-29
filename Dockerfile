FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go build -o /out/api ./cmd/api
RUN go build -o /out/worker ./cmd/worker

FROM alpine:3.21 AS api
WORKDIR /app
COPY --from=build /out/api /app/api
EXPOSE 8080
CMD ["/app/api"]

FROM alpine:3.21 AS worker
WORKDIR /app
COPY --from=build /out/worker /app/worker
CMD ["/app/worker"]
