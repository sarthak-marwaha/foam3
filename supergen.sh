rm -r build/
mkdir build/

# Copy over directories from src
cd b2b/src
for d in *; do
  if [ "$d" = 'target/' ]; then
    continue
  fi
  if [ "$d" = 'gen.sh' ]; then
    continue
  fi
  cp -r $d ../../build
done
cd ../../

cd common/src
for d in * ; do
    if [ "$d" = 'target/' ]; then
        continue
    fi
    if [ "$d" = 'gen.sh' ]; then
        continue
    fi
    cp -r $d ../../build
done
cd ../../

cd ingenico/src
for d in * ; do
    if [ "$d" = 'target/' ]; then
        continue
    fi
    if [ "$d" = 'gen.sh' ]; then
        continue
    fi
    cp -r $d ../../build
done
cd ../../

cd interac/src
for d in *; do
  if [ "$d" = 'target/' ]; then
    continue
  fi
  if [ "$d" = 'gen.sh' ]; then
    continue
  fi
  cp -r $d ../../build
done
cd ../../

cd retail/src
for d in * ; do
    if [ "$d" = 'target/' ]; then
        continue
    fi
    if [ "$d" = 'gen.sh' ]; then
        continue
    fi
    cp -r $d ../../build
done
cd ../../

cd transaction-service/src
for d in * ; do
    if [ "$d" = 'target/' ]; then
        continue
    fi
    if [ "$d" = 'gen.sh' ]; then
        continue
    fi
    cp -r $d ../../build
done
cd ../../


# Generate java files to build dir
echo $cwd
cwd=$(pwd)
node ../foam2/tools/genjava.js $cwd/tools/classes.js $cwd/build $cwd
