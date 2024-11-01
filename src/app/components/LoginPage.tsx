"use client";
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import Image from "next/image";
import backgroundImage from "../assets/background_login.png";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/app/UserContext";

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const route = useRouter();
  const { setUser } = useUser();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onFinish = async (values: LoginFormValues) => {
    try {
      const response = await fetch(
        "http://api.koistory.site/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
  
      const data = await response.json();
      console.log("🚀 ~ onFinish ~ data:", data)
  
      if (response.ok) {
        toast.success("Login successful!");
        route.push("/admin");
        setUser(data.data);
        sessionStorage.setItem('userData', JSON.stringify(data.data));
      } else {
        toast.error(data.log || "Login failed!");
      }
    } catch (error) {
      console.log("🚀 ~ onFinish ~ error:", error);
      toast.error("An error occurred during login!");
    }
  };
  

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          style={{
            objectFit: "cover",
            opacity: 0.5,
          }}
          quality={100}
        />
      </div>
      <div
        className={`relative 
          z-10 
          w-full 
          max-w-md 
          p-8 
          bg-white 
          rounded-xl 
          shadow-2xl 
          transition-all 
          duration-500 
          transform 
          ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        <div className="text-center mb-6">
          <Title level={2} className="text-gray-800 mb-4">
            Welcome Back
          </Title>
          <p className="text-gray-600 mb-6">Please enter your credentials</p>
        </div>

        <Form
          name="loginForm"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email!",
                type: "email",
              },
            ]}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-10"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="h-10"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              block
              className="h-10 text-base"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Forgot Password?
          </a>
        </div>
      </div>
      <ToastContainer /> {/* Toast container for rendering notifications */}
    </div>
  );
};

export default LoginPage;
