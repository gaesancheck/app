const { withPodfile } = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

module.exports = function withGoogleModularHeaders(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = mergeContents({
      src: config.modResults.contents,
      newSrc: [
        "  pod 'AppCheckCore', :modular_headers => true",
        "  pod 'GoogleUtilities', :modular_headers => true",
        "  pod 'RecaptchaInterop', :modular_headers => true",
      ].join('\n'),
      tag: 'google-modular-headers',
      anchor: /use_expo_modules!/, // Keep these dependencies inside the app target.
      offset: 1,
      comment: '#',
    }).contents;
    return config;
  });
};
