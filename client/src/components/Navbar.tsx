import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePost } from "../hooks/usePosts";
import { useUser } from "../hooks/useUser";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { clearPosts } = usePost();
  const { clearUsers } = useUser();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearPosts();
    clearUsers();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-dark text-white p-4">
      <div className="flex items-center justify-between p-4 bg-surface-dark text-white">
        <Link to="/" className="text-lg font-bold">
          Vinstagram
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            to={`/profile/${user?.id}`}
            className="flex items-center space-x-2"
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand text-inverted flex items-center justify-center text-2xl font-bold shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 px-2 py-1 rounded cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
