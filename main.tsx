import { render } from "preact";
import "./assets/styles.css";
import App from "./App.tsx";

render(<App />, document.getElementById("app") as HTMLElement);
