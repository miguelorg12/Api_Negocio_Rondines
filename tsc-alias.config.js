module.exports = {
  baseUrl: './src',
  paths: {
    '@controllers/*': ['controllers/*'],
    '@interfaces/*': ['interfaces/*'],
    '@services/*': ['services/*'],
    '@utils/*': ['utils/*'],
    '@configs/*': ['configs/*'],
    '@routes/*': ['routes/*'],
    '@validators/*': ['utils/validators/*'],
    '@entities/*': ['interfaces/entity/*'],
    '@dto/*': ['interfaces/dto/*'],
  },
  outDir: './dist'
}; 