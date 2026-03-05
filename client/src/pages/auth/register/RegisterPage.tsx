import { Button, Form, Input, message } from "antd";
import WelcomeContent from "../common/WelcomeContent";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../apiservices/userService";
import { useState } from "react";

// ── Validation helpers (mirror backend rules exactly) ─────────────────────────

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;
  return passwordRegex.test(password);
};

// ─────────────────────────────────────────────────────────────────────────────

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await registerUser(values);
      message.success(response.message);
      navigate("/login");
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="col-span-1 lg:flex hidden">
        <WelcomeContent />
      </div>

      <div className="h-screen flex items-center justify-center">
        <Form
          className="flex flex-col gap-5 w-96"
          layout="vertical"
          onFinish={onFinish}
        >
          <h1 className="text-2xl font-bold text-gray-600">
            Register Your Account
          </h1>

          {/* Full Name */}
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter your full name" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 50, message: "Name cannot exceed 50 characters" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "Name can only contain letters and spaces",
              },
            ]}
          >
            <Input placeholder="Full Name" size="large" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email address" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!isValidEmail(value)) {
                    return Promise.reject(
                      new Error("Please enter a valid email address (must include @)")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="example@email.com" size="large" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Password"
            extra="Min 8 characters — must include uppercase, lowercase, number, and special character (e.g. @$!%*?&)"
            rules={[
              { required: true, message: "Please enter a password" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (value.length < 8) {
                    return Promise.reject(
                      new Error("Password must be at least 8 characters")
                    );
                  }
                  if (!isStrongPassword(value)) {
                    return Promise.reject(
                      new Error(
                        "Password must include uppercase, lowercase, number, and special character (@$!%*?&#)"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} size="large">
            Register
          </Button>

          <p>
            Already Have An Account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default RegisterPage;