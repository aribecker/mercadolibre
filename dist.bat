mkdir dist
del /S /F /Q dist

mkdir dist\img
copy src\img\*.* dist\img

copy src\ml.html dist
copy src\ml.css dist

browserify src/ml.js -o dist/ml.js -d
