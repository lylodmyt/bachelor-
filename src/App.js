import './App.css';
import {Route, Routes} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import AuthService from "./services/auth-service";
import NavigationBar from "./components/NavigationBar";
import Profile from "./components/Profile";
import Public from "./components/Public";
import Tests from "./components/Tests";
import Topics from "./components/Topics";
import Quiz from "./components/Quiz";
import Login from "./components/Login";
import Register from "./components/Register";
import Reports from "./components/Reports";
import Questions from "./components/Questions";
import TestQuestions from "./components/TestQuestions";

function App() {
    if (AuthService.getCurrentUser()) {
        return (
            <Routes>
                <Route path="/" element={<NavigationBar/>}>
                    <Route index element={<Profile/>}/>
                    <Route path="/profile" element={<Profile/>}/>
                    <Route path="/public" element={<Public/>}/>
                    <Route path="/tests" element={<Tests/>}/>
                    <Route path="/topics" element={<Topics/>}/>
                    <Route path="/reports" element={<Reports/>}/>
                    <Route path="/questions/:topicId" element={<Questions/>}/>
                    <Route path="/test/:testId" element={<TestQuestions/>}/>
                </Route>
                <Route path="/quiz/:testId" element={<Quiz/>}/>
            </Routes>
        )
    } else {
        return (
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
            </Routes>
        );
    }
}
export default App;
