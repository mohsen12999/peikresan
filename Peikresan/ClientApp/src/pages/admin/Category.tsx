import React from "react";
import { connect } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { Input, Space, Button, AutoComplete, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import MyPrivateLayout from "../../components/MyPrivateLayout";
import { ApplicationState } from "../../store";
import { ICategory } from "../../shares/Interfaces";
import { actionCreators } from "../../store/Auth";
import { AdminDataModel, AdminDataUrl, LOGIN_URL } from "../../shares/URLs";
import { AdminPath, Status } from "../../shares/Constants";

import "./Admin.css";

const { TextArea } = Input;

interface ICategoryProps {
  categories: ICategory[];
  status: Status;

  AddOrChangeElement: Function;
  ResetStatus: Function;
}

interface IParamTypes {
  id: string;
}

const Category: React.FC<ICategoryProps> = ({
  categories,
  status,
  AddOrChangeElement,
  ResetStatus,
}) => {
  const { id } = useParams<IParamTypes>();

  React.useEffect(() => {
    if (status == Status.SUCCEEDED) {
      const history = useHistory();
      history.push(AdminPath.Categories);
      message.success("با موفقیت ذخیره شد.");
    } else if (status == Status.FAILED) {
      message.error("اشکال در ذخیره");
    }
    return ResetStatus();
  }, [status]);

  const [file, setFile] = React.useState<File>();
  const [title, setTitle] = React.useState<string>();
  const [category, setCategory] = React.useState<string>();
  const [description, setDescription] = React.useState<string>();
  const [showImage, setShowImage] = React.useState<string>();

  const validateInputs = () => title && title.length > 1;

  if (id !== undefined) {
    const category = categories.find((c) => c.id === Number(id));
    // console.log(id, category, title);
    if (category !== undefined && title === undefined) {
      setTitle(category.title);
      setDescription(category.description);
      setShowImage(category.img);
    }
  }

  const sendData = () => {
    if (!validateInputs() || status == Status.LOADING) return;

    var formData = new FormData();
    formData.append("id", id);
    formData.append("file", file ?? "");
    formData.append("title", title ?? "");
    formData.append("description", description ?? "");
    formData.append("category", category ?? "");

    AddOrChangeElement(
      AdminDataUrl.ADD_CHANGE_CATEGORY_URL,
      AdminDataModel.Categories,
      formData
    );
  };

  return (
    <MyPrivateLayout>
      <div className="admin-container">
        <h1>دسته بندی</h1>
        <Space direction="vertical">
          <img style={{ maxWidth: "300px" }} src={showImage} alt="تصویر دسته" />
          <input
            id="product-img"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                const file = files[0];
                setFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result;
                  if (result) {
                    setShowImage(result as string);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Button
            style={{ minWidth: "350px" }}
            icon={<UploadOutlined />}
            onClick={() => {
              const productImage = document.getElementById("product-img");
              if (productImage) {
                productImage.click();
              }
            }}
          >
            بارگزاری عکس
          </Button>

          <Input
            placeholder="نام دسته‌بندی جدید"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <TextArea
            rows={4}
            value={description}
            placeholder="توضیحات"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />

          <AutoComplete
            style={{ minWidth: "350px" }}
            options={categories.map((cat) => ({
              value: cat.title,
            }))}
            placeholder=" نام دسته بندی والد"
            filterOption={(inputValue, option) =>
              option?.value.indexOf(inputValue) !== -1
            }
            onChange={(value) => {
              setCategory(value);
            }}
          />

          <Button
            type="primary"
            disabled={!validateInputs()}
            onClick={sendData}
          >
            ذخیره
          </Button>
        </Space>
      </div>
    </MyPrivateLayout>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  categories: state.auth?.categories ?? [],
  status: state.auth?.status ?? Status.INIT,
});

const mapDispatchToProps = {
  AddOrChangeElement: actionCreators.addOrChangeElement,
  ResetStatus: actionCreators.resetStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(Category);
