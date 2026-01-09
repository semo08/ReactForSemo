// 라우팅 설정
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Detail from "./routes/Detail";
import Home from "./routes/Home";
import Collection from "./routes/Collection";
import Search from "./routes/Search";
import Wishlist from "./routes/Wishlist";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import ScrollManager from "./components/ScrollManager";

function App() {
  return (
    // AuthProvider로 전체를 감싸서 모든 컴포넌트에서 로그인 정보 접근 가능
    <AuthProvider>
      {/* WishlistProvider로 찜 기능 전역 관리 */}
      <WishlistProvider>
        <Router basename="/ReactForSemo">
          {/* 전역 스크롤 위치 관리 */}
          <ScrollManager />

          <Routes>
            {/* 영화 상세 페이지 */}
            <Route path="/movie/:id" element={<Detail />} />

            {/* 컬렉션 페이지 */}
            <Route path="/collection/:id" element={<Collection />} />

            {/* 검색 페이지 */}
            <Route path="/search" element={<Search />} />

            {/* 찜 목록 페이지 */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* 홈 페이지 */}
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;