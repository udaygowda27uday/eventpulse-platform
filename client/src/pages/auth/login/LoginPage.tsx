import { Button, Form, Input, message } from "antd";
import WelcomeContent from "../common/WelcomeContent";
import { Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../../apiservices/userService";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await loginUser(values);
      message.success(response.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message);
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
            Login Your Account
          </h1>

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
            rules={[
              { required: true, message: "Please enter your password" },
            ]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} size="large">
            Login
          </Button>

          <p>
            Don't Have An Account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;