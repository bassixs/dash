import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: {
    tailwindcss: {}, // ✅ Так нужно!
    autoprefixer: {},
  },
};
