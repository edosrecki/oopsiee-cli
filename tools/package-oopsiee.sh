#!/usr/bin/env bash

version="$1"

npx replace-in-file '0.0.0-dev' "$version" ./src/version.ts
npm run bundle

cd bin
tar --transform s/-linux// -czf "oopsiee-linux.tar.gz" oopsiee-linux
tar --transform s/-macos// -czf "oopsiee-macos.tar.gz" oopsiee-macos
tar --transform s/-win// -czf "oopsiee-win.tar.gz" oopsiee-win.exe
cd ..
