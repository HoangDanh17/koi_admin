"use client";
import React, { useEffect, useState, useRef } from "react";
import { Table, Image, Spin, Modal, Button, Upload, Form, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { ref, listAll, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

interface ImageData {
  key: string;
  id: number;
  image: string;
  image_url: string;
}

const ImageTable: React.FC = () => {
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fileRef = useRef<RcFile | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const listRef = ref(storage, "admin");
    const res = await listAll(listRef);
    const items = await Promise.all(
      res.items.map(async (itemRef, index) => {
        const url = await getDownloadURL(itemRef);
        return {
          key: itemRef.name,
          id: index + 1,
          image: url,
          image_url: url,
        };
      })
    );
    setImageData(items);
    setLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (fileRef.current) {
      const imageRef = ref(storage, `admin/${fileRef.current.name}`);
      setLoading(true);
      try {
        await uploadBytes(imageRef, fileRef.current);
        message.success("Image uploaded successfully");
        fetchImages(); // Refresh the images list
        fileRef.current = null; // Clear the file reference
      } catch (error) {
        console.error("Upload error:", error);
        message.error("Failed to upload image");
      } finally {
        setLoading(false);
        setIsModalVisible(false); // Close modal after the upload
      }
    } else {
      message.warning("Please select an image file.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUploadChange = (info: UploadChangeParam<UploadFile<RcFile>>) => {
    if (info.fileList.length > 0) {
      fileRef.current = info.fileList[0].originFileObj as RcFile;
    } else {
      fileRef.current = null; // Reset if no file selected
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (src: string) => <Image width={130} src={src} alt="Image" />,
    },
    {
      title: "Image URL",
      dataIndex: "image_url",
      key: "image_url",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
  ];

  return (
    <div>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Add Image
        </Button>
      </div>

      <Modal
        title="Add New Image"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Upload"
      >
        <Form layout="vertical">
          <Form.Item label="Select Image">
            <Upload
              beforeUpload={() => false}
              onChange={handleUploadChange}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Choose Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={imageData}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default ImageTable;
