import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../composant/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },{
    path: '/app',
    element :<App/>
  }
]);
