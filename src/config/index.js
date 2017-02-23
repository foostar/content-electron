import dev from './dev';
import prod from './prod';

const config = process.NODE_ENV === 'production' ? prod : dev;

export default config;
