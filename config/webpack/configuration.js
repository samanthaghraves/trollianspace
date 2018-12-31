// Common configuration for webpacker loaded from config/webpacker.yml

const { basename, dirname, extname, join, resolve } = require('path');
const { env } = require('process');
const { safeLoad } = require('js-yaml');
const { lstatSync, readFileSync } = require('fs');
const glob = require('glob');

const configPath = resolve('config', 'webpacker.yml');
const loadersDir = join(__dirname, 'loaders');
<<<<<<< HEAD
const settings = safeLoad(readFileSync(configPath), 'utf8')[env.RAILS_ENV || env.NODE_ENV];
=======
const settings = safeLoad(readFileSync(configPath), 'utf8')[env.NODE_ENV];
const flavourFiles = glob.sync('app/javascript/flavours/*/theme.yml');
const skinFiles = glob.sync('app/javascript/skins/*/*');
const flavours = {};
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62

const core = function () {
  const coreFile = resolve('app', 'javascript', 'core', 'theme.yml');
  const data = safeLoad(readFileSync(coreFile), 'utf8');
  if (!data.pack_directory) {
    data.pack_directory = dirname(coreFile);
  }
  return data.pack ? data : {};
}();

for (let i = 0; i < flavourFiles.length; i++) {
  const flavourFile = flavourFiles[i];
  const data = safeLoad(readFileSync(flavourFile), 'utf8');
  data.name = basename(dirname(flavourFile));
  data.skin = {};
  if (!data.pack_directory) {
    data.pack_directory = dirname(flavourFile);
  }
  if (data.locales) {
    data.locales = join(dirname(flavourFile), data.locales);
  }
  if (data.pack && typeof data.pack === 'object') {
    flavours[data.name] = data;
  }
}

for (let i = 0; i < skinFiles.length; i++) {
  const skinFile = skinFiles[i];
  let skin = basename(skinFile);
  const name = basename(dirname(skinFile));
  if (!flavours[name]) {
    continue;
  }
  const data = flavours[name].skin;
  if (lstatSync(skinFile).isDirectory()) {
    data[skin] = {};
    const skinPacks = glob.sync(join(skinFile, '*.{css,scss}'));
    for (let j = 0; j < skinPacks.length; j++) {
      const pack = skinPacks[j];
      data[skin][basename(pack, extname(pack))] = pack;
    }
  } else if ((skin = skin.match(/^(.*)\.s?css$/i))) {
    data[skin[1]] = { common: skinFile };
  }
}

function removeOuterSlashes(string) {
  return string.replace(/^\/*/, '').replace(/\/*$/, '');
}

function formatPublicPath(host = '', path = '') {
  let formattedHost = removeOuterSlashes(host);
  if (formattedHost && !/^http/i.test(formattedHost)) {
    formattedHost = `//${formattedHost}`;
  }
  const formattedPath = removeOuterSlashes(path);
  return `${formattedHost}/${formattedPath}/`;
}

const output = {
  path: resolve('public', settings.public_output_path),
  publicPath: formatPublicPath(env.CDN_HOST, settings.public_output_path),
};

module.exports = {
  settings,
  core,
  flavours,
  env: {
    CDN_HOST: env.CDN_HOST,
    NODE_ENV: env.NODE_ENV,
  },
  loadersDir,
  output,
};
