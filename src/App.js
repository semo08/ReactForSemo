// 라우팅 설정
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Detail from "./routes/Detail";
import Home from "./routes/Home";
import Collection from "./routes/Collection";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    // AuthProvider로 전체를 감싸서 모든 컴포넌트에서 로그인 정보 접근 가능
    <AuthProvider>
      <Router basename="/ReactForSemo">
        <Routes>
          {/* 영화 상세 페이지 */}
          <Route path="/movie/:id" element={<Detail />} />

          {/* 컬렉션 페이지 */}
          <Route path="/collection/:id" element={<Collection />} />

          {/* 홈 페이지 */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;