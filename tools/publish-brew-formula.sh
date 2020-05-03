#!/usr/bin/env bash

version="$1"
url="https://github.com/edosrecki/oopsiee-cli/releases/download/v$version/oopsiee-macos-$version.tar.gz"
checksum=$(shasum -a 256 bin/oopsiee-macos.tar.gz | awk '{ print $1 }')

git clone "https://${OOPSIEE_GITHUB_TOKEN}@github.com/edosrecki/homebrew-tools.git"
cd homebrew-tools

git config user.email "${GIT_EMAIL}"
git config user.name "Dinko Osrecki"

cat <<EOF > oopsiee.rb
class Oopsiee < Formula
  desc "CLI tool which simplifies daily operations and on-call duty"
  homepage "https://github.com/edosrecki/oopsiee-cli"
  url "$url"
  sha256 "$checksum"

  bottle :unneeded

  def install
    bin.install "oopsiee"
  end

  test do
    system "#{bin}/oopsiee", "--version"
  end
end
EOF

git add oopsiee.rb
git commit -m "chore: release oopsiee v$version"
git push

cd ..
rm -rf homebrew-tools
