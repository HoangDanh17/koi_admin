"use client";
import React, {
  useState,
  useMemo,
  useRef,
  ForwardedRef,
  useEffect,
} from "react";
import {
  Button,
  Col,
  Modal,
  Row,
  message,
  Input,
  Table,
  Image,
  Select,
} from "antd";
import dynamic from "next/dynamic";
import { PlusOutlined, LinkOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
const { Option } = Select;

interface ImageData {
  key: string;
  id: number;
  image: string;
  image_url: string;
}

interface ReactQuillProps {
  forwardedRef: ForwardedRef<ReactQuill>;
  value: string;
  onChange: (content: string) => void;
  modules: object;
  formats: string[];
  theme: string;
  style: React.CSSProperties;
}

const ReactQuillDynamic = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    return function comp({ forwardedRef, ...props }: ReactQuillProps) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);
import "react-quill/dist/quill.snow.css";
import { CategoryResponse } from "@/app/components/CategoryTable";
interface DummyData {
  id: number;
  name: string;
}
interface Category {
  id: string;
  name: string;
}

const BlogTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageURLModalOpen, setIsImageURLModalOpen] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const quillRef = useRef<ReactQuill>(null);
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    let userData;
    if (userDataString) {
      try {
        userData = JSON.parse(userDataString);
        console.log("🚀 ~ User Data:", userData);
      } catch (error) {
        console.error("Failed to parse userData:", error);
      }
    } else {
      console.log("No user data found in localStorage.");
    }
  }, []);

  const [dataSource, setDataSource] = useState<DummyData[]>([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://api.koistory.site/api/v1/categories"
      );
      const result: CategoryResponse = await response.json();

      if (result.status === 200) {
        const formattedData = result.data.map((category) => ({
          id: category.id,
          name: category.name,
        }));
        setCategories(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const fetchImages = async () => {
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
  };

  const insertImage = (url: string) => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    const index = range ? range.index : 0;

    quill.insertEmbed(index, "image", url, "user");

    quill.setSelection(index + 1, 0);

    const content = quill.root.innerHTML.replace(/"/g, "'");
    setEditorContent(content);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTitle("");
    setCategoryId(null);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleImageURLSubmit = () => {
    if (!imageURL) {
      message.error("Please enter image URL");
      return;
    }

    try {
      new URL(imageURL);
      insertImage(imageURL);
      setIsImageURLModalOpen(false);
      setImageURL("");
    } catch (error) {
      console.log("🚀 ~ handleImageURLSubmit ~ error:", error);
      message.error("Please enter a valid URL");
    }
  };

  const modules: object = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: "1" }, { header: "2" }, { font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: () => setIsImageURLModalOpen(true),
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

  const handleSubmit = async () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const content = editor.root.innerHTML.replace(/"/g, "'");

      const userDataString = sessionStorage.getItem("userData");
      let userData = null;

      if (userDataString) {
        try {
          userData = JSON.parse(userDataString);
          console.log("🚀 ~ User Data:", userData);
        } catch (error) {
          console.error("Failed to parse userData:", error);
        }
      } else {
        console.log("No user data found in localStorage.");
        return;
      }

      const payload = {
        author_name: userData?.user_name,
        category_id: categoryId,
        content: content,
        title: title,
        user_id: userData?.id,
      };

      try {
        const response = await fetch(
          "http://api.koistory.site/api/v1/post-blog",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error submitting blog post:", {
            status: response.status,
            statusText: response.statusText,
            error: errorResponse,
          });
          message.error(
            `Failed to submit the blog post. Status: ${response.status} - ${response.statusText}`
          );
          return;
        }

        const responseData = await response.json();
        message.success(responseData.message);
      } catch (error) {
        console.error("Network or unexpected error:", error);
        message.error("Failed to submit the blog post due to a network error.");
      }
    }
    handleCloseModal();
  };

  const columns = [
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

  const columnsTable = [
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
      title: "Action",
      key: "action",
      render: (_: string, record: DummyData) => (
        <Button
          type="primary"
          style={{ background: "red", color: "#FFF" }}
          onClick={() => handleDelete(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    setDataSource((prevData) => prevData.filter((item) => item.id !== id));
    message.success(`Deleted item with ID: ${id}`);
  };
  return (
    <div>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            onClick={handleOpenModal}
            icon={<PlusOutlined />}
          >
            Add blog
          </Button>
        </Col>
      </Row>

      <Modal
        title="Text Editor"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        width={1200}
        style={{ top: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: 16, marginRight: 10, width: "100%" }} // Adjust width as needed
          />

          <Select
            placeholder="Chọn mệnh phù hợp"
            style={{ marginBottom: 16, width: "100%" }}
            value={categoryId}
            onChange={(value) => setCategoryId(value)}
          >
            {categories.map((fate) => (
              <Option key={fate.id} value={fate.id}>
                {fate.name}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1.6, marginRight: 20, marginBottom: 10 }}>
            <ReactQuillDynamic
              forwardedRef={quillRef}
              theme="snow"
              value={editorContent}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              style={{ height: "550px" }}
            />
          </div>
          <div style={{ maxHeight: "550px", overflowY: "auto", flex: 1 }}>
            <Table
              columns={columns}
              dataSource={imageData}
              pagination={false}
              scroll={{ y: 550 }}
              rowKey="key"
              style={{ marginTop: 16 }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Insert Image URL"
        open={isImageURLModalOpen}
        onOk={handleImageURLSubmit}
        onCancel={() => {
          setIsImageURLModalOpen(false);
          setImageURL("");
        }}
      >
        <Input
          prefix={<LinkOutlined />}
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          onPressEnter={handleImageURLSubmit}
        />
      </Modal>

      <Table
        columns={columnsTable}
        dataSource={dataSource}
        pagination={{ pageSize: 10 }}
        rowKey="id"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default BlogTable;
