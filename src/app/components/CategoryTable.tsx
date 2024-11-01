"use client";
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Row, Col } from "antd";

const { Option } = Select;

interface Category {
  id: number;
  name: string;
  description: string;
  fate: string;
}

const CategoryTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<Category | null>(null);

  const data: Category[] = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    name: `Category ${index + 1}`,
    description: `Description ${index + 1}`,
    fate: index % 2 === 0 ? "fire" : "water",
  }));

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Fate",
      dataIndex: "fate",
      key: "fate",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: Category) => (
        <Button
          style={{ background: "#FFB26F", color: "white" }}
          onClick={() => openEditModal(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const openEditModal = (record: Category) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      fate_id: record.fate ? [record.fate] : [],
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values);
        setIsModalOpen(false);
        form.resetFields();
        setEditingRecord(null);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <div>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" onClick={showModal}>
            Add Category
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? "Edit Category" : "Tạo Category Mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name!" }]}
          >
            <Input placeholder="Input name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description!" },
            ]}
          >
            <Input.TextArea placeholder="Input description" />
          </Form.Item>
          <Form.Item
            name="fate_id"
            label="Fate"
            rules={[{ required: true, message: "Please select a fate!" }]}
          >
            <Select mode="multiple" placeholder="Select fate">
              <Option value="fire">Fire</Option>
              <Option value="earth">Earth</Option>
              <Option value="metal">Metal</Option>
              <Option value="water">Water</Option>
              <Option value="wood">Wood</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryTable;
