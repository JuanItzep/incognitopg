import Execution from "./pages/Execution";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

function App() {
    return (
        <Router basename="/incognitopg">
            <Routes>
                <Route path="/" element={<Execution />} />
            </Routes>
        </Router>
    );
}

export default App;
