import "@/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import LandingShowcase from "@/pages/LandingShowcase";
import NotFound from "@/pages/NotFound";
import { ROUTES } from "@/constants/routes";

function App() {
    return (
        <ThemeProvider>
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path={ROUTES.home} element={<LandingShowcase />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    );
}

export default App;
