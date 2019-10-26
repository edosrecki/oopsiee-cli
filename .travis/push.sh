#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_bin() {
  git add --force bin/
  git commit -m 'chore: package into executables' -m '[ci skip]'
}

push_to_github() {
  git remote rm origin
  git remote add origin https://${GH_TOKEN}@github.com/edosrecki/oopsiee-cli.git >/dev/null 2>&1
  git push origin master --quiet >/dev/null 2>&1
}

setup_git
commit_bin
push_to_github
