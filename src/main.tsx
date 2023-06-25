import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.less";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// let bg_list = ["spring", "summer", "autumn", "winter"];
// var i = 0;
// setInterval(function () {
//   if (i == bg_list.length) {
//     i = 0;
//   }
//   console.log(bg_list[i]);
//   document.getElementById("bg")!.style.backgroundImage =
//     "url(/src/assets/bg/" + bg_list[i] + ".png)";
//   i += 1;
// }, 60000);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
