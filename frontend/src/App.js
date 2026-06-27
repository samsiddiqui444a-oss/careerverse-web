import "@/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import LandingShowcase from "@/pages/LandingShowcase";
import NotFound from "@/pages/NotFound";
import ClassExplorer from "@/pages/ClassExplorer";
import ClassDetail from "@/pages/ClassDetail";
import StreamExplorer from "@/pages/StreamExplorer";
import StreamDetail from "@/pages/StreamDetail";
import CareerLibrary from "@/pages/CareerLibrary";
import CareerDetail from "@/pages/CareerDetail";
import ScholarshipExplorer from "@/pages/ScholarshipExplorer";
import { ROUTES } from "@/constants/routes";

function App() {
    return (
        <ThemeProvider>
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path={ROUTES.home} element={<LandingShowcase />} />
                            <Route path={ROUTES.classes} element={<ClassExplorer />} />
                            <Route path="/classes/:classId" element={<ClassDetail />} />
                            <Route path={ROUTES.streams} element={<StreamExplorer />} />
                            <Route path="/streams/:slug" element={<StreamDetail />} />
                            <Route path={ROUTES.careers} element={<CareerLibrary />} />
                            <Route path="/careers/:slug" element={<CareerDetail />} />
                            <Route path={ROUTES.scholarships} element={<ScholarshipExplorer />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    );
}

export default App;
