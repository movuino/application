# ZigWig App

The ZigWig app is a javascript/electron based interface that allows you to easily use the movuino platform with any other software on your computer.

We are still very early in development.

**movuino.js install**
```
cd ~
git clone git@github.com:topela/movuino.js.git
cd movuino.js
yarn (or npm install)
```

On Linux you'll need permission to access the serial device. Add yourself to the right group then relog.

Arch
```
$ gpasswd -a $USER uucp
```
Ubuntu
```
$ usermod -a -G dialout $USER
```

**ZigWig app install**
```
cd ~
git clone git@github.com:topela/ZigWig.git
cd ZigWig
yarn (or npm install)
rm -r node_modules/movuino.js
ln -s ~/movuino.js ~/ZigWig/node_modules/
yarn run rebuild (or npm run rebuild)
```
