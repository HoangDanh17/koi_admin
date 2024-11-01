"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

// Define the Fate interface
interface Fate {
  id: string;
  element: string;
}

// Define the FateResponse interface for the fates API response
interface FateResponse {
  status: number;
  data: Fate[];
}

// Define the Category interface
interface Category {
  id: number; // Using number for index-based ID
  name: string;
  description: string;
  fate: string[];
}

// Define the CategoryResponse interface for the categories API response
export interface CategoryResponse {
  status: number;
  data: {
    id: string;
    name: string;
    description: string;
    Fate: Fate[];
  }[];
}

const CategoryTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fates, setFates] = useState<Fate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchFates = async () => {
    try {
      const response = await fetch("http://api.koistory.site/api/v1/fates");
      const result: FateResponse = await response.json();

      if (result.status === 200) {
        setFates(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch fates:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://api.koistory.site/api/v1/categories"
      );
      const result: CategoryResponse = await response.json();

      if (result.status === 200) {
        const formattedData = result.data.map((category, index) => ({
          id: index + 1, // Use index + 1 as ID
          name: category.name,
          description: category.description,
          fate: category.Fate.map((fate) => fate.element),
        }));
        setCategories(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchFates();
    fetchCategories(); 
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const dataToSubmit = {
        description: values.description,
        fate_id: values.fate_id,
        name: values.name,
      };
      console.log("🚀 ~ handleOk ~ dataToSubmit:", dataToSubmit);

      const response = await fetch(
        "http://api.koistory.site/api/v1/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        console.log("Response from API:", result);
        setIsModalOpen(false);
        form.resetFields();
        fetchCategories(); // Refresh categories after adding a new one
      } else {
        toast.error(`Failed to add category: ${result.message}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Submission failed. Please try again.");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100, 
    },
    {
      title: "Tiêu đề",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mệnh",
      dataIndex: "fate",
      key: "fate",
      render: (fate: string[]) => fate.join(", "), // Render fate as a comma-separated string
    },
  ];

  return (
    <div>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
            Thêm loại
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={categories} // Use fetched categories
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={"Tạo loại mới"}
        open={isModalOpen}
        okText="Xác nhận"
        cancelText="Hủy"
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tiêu đề"
            rules={[{ required: true, message: "Please enter the name!" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả!" },
            ]}
          >
            <Input.TextArea placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item
            name="fate_id"
            label="Mệnh"
            rules={[{ required: true, message: "Vui lòng chọn mệnh!" }]}
          >
            <Select mode="multiple" placeholder="Chọn mệnh phù hợp">
              {fates.map((fate) => (
                <Option key={fate.id} value={fate.id}>
                  {fate.element}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CategoryTable;
