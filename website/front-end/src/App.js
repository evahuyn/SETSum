import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Route, Routes} from "react-router-dom";
import Statistics from "./pages/Statistics";
import Comments from "./pages/Comments";
import CourseRawdata from "./pages/CourseRawdata";
import InstructorRawdata from "./pages/InstructorRawdata";
import Account from "./pages/Account";
import InstructorCategory from "./pages/InstructorCategory";
import CourseCategory from "./pages/CourseCategory";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/rates"} element={<Statistics />}></Route>
        <Route path={"/"} element = {<Login />}></Route>
        <Route path={"/home"} element = {<Home />}></Route>
          <Route path={"/comments"} element={<Comments />}></Route>
          <Route path={"/course-rawdata"} element={<CourseRawdata />}></Route>
          <Route path={"/instructor-rawdata"} element={<InstructorRawdata />}></Route>
          <Route path={"/account"} element={<Account />}></Route>
          <Route path={"/instructor-category"} element={<InstructorCategory />}></Route>
          <Route path={"/course-category"} element={<CourseCategory />}></Route>
      </Routes>
    </div>
  );
}

export default App;
