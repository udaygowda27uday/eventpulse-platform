
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import { getCurrentUser } from "../apiservices/userService";
import { message } from "antd";
import { useUser } from "../hooks/useUser";
import Spinner from "../components/Spinner";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();

        if (active) {
          setCurrentUser(response.data);
        }
      } catch (error: any) {
        if (active) {
          setCurrentUser(null);
          message.error(
            error.response?.data?.message ||
              "Please login to continue",
          );
          navigate("/login", { replace: true });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (currentUser) {
      setLoading(false);
    } else {
      checkAuth();
    }

    return () => {
      active = false;
    };
  }, [currentUser, setCurrentUser, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex gap-5 h-screen">
      <Sidebar user={currentUser} />
      <div className="flex-1 px-5 pb-10">{children}</div>
    </div>
  );
}

export default PrivateLayout;
