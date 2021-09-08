export const config = {
  theme: {
    color: [
      '__tests__/theme/color/Default.less',
      '__tests__/theme/color/Blue.less',
    ],
    layout: [
      '__tests__/theme/layout/Default.less',
      '__tests__/theme/layout/Large.less',
    ],
  },
  componentDir: '__tests__/components',
  outputDir: '.theme',
  watching: true,
};
