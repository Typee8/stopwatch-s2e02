import React from "react";
import { createRoot } from "react-dom/client";

import TasksManager from "./components/TasksManager";

import "./styles/reset.css";
import "./styles/fonts.css";
import "./styles/main.css";
import "./styles/tablet.css";
import "./styles/buttons.css";

const App = () => <TasksManager />;

const root = createRoot(document.querySelector("#root"));
root.render(<App />);

window.addEventListener('resize', () => console.log(window.innerWidth));