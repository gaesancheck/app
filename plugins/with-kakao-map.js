const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withKakaoMap(config) {
  return withProjectBuildGradle(config, (config) => {
    const repository = 'https://devrepo.kakao.com/nexus/repository/kakaomap-releases/';
    if (!config.modResults.contents.includes(repository)) {
      config.modResults.contents += `\n// Kakao Maps SDK repository\nallprojects {\n    repositories {\n        maven { url '${repository}' }\n    }\n}\n`;
    }
    return config;
  });
};
