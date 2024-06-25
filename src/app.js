import React from 'react';
import { createRoot } from 'react-dom/client';

import TasksManager from './components/TasksManager'

function importCSSFiles(styles) {
  styles.keys().forEach(styles);
}

const styles = require.context("./styles", false, /\.css$/);
importCSSFiles(styles);

const App = () => <TasksManager/>;

const root = createRoot(document.querySelector('#root'));
root.render(<App />);

