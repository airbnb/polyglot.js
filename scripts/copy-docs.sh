#!/bin/sh
echo "Copying over docs files..."
echo ""

docs="docs"

files[0]="docco.css"
files[1]="polyglot.html"
files[2]="public/"

for file in "${files[@]}"
do
  echo "Copying '${file}'"
  git checkout master "${docs}/${file}"
  git mv -f "${docs}/${file}" "${file}"
done
