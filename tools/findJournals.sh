#!/bin/bash

IN_FILE=
INSTANCE=
OUT_FILE=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -J : Instance"
    echo "  -O : Output File, no option defaults to stdout"
}

while getopts "I:J:O:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        J) INSTANCE=$OPTARG ;;
        O) OUT_FILE=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')"
 # "interac/src"
)

if [ ! -z $OUT_FILE ]; then
    rm $OUT_FILE
fi

sed 's/#.*//;s/^[[:space:]]*//;s/[[:space:]]*$//' < "${IN_FILE:-/dev/stdin}" | while read -r file; do
    if [ ! -z $file ]; then
        find ${sources[@]} -type f \( -name "${file}" -o -name "${file}.jrl" \) >> "${OUT_FILE:-/dev/stdout}"
    fi
done

exit 0