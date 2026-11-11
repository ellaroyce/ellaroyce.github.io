// Client entry for the legal pages (impressum.html, datenschutz.html). Kept
// separate from the homepage so these pages do not download the canvas engines.
import { mount } from './mount';
import { Datenschutz } from './pages/Datenschutz';
import { Impressum } from './pages/Impressum';

const page = document.getElementById('root')?.dataset.page;
mount(page === 'datenschutz' ? <Datenschutz /> : <Impressum />);
