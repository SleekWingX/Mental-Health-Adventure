import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Auth from '../utils/auth';
import { ADD_USER } from '../utils/mutations';
import { Form, Input, Button, Typography, Modal } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import '../components/Cart/index'; // Ensure this path is correct based on your project structure

const { Title } = Typography;

function Signup() {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addUser, { data, error }] = useMutation(ADD_USER);

  const handleFormSubmit = async (values) => {
    console.log('Values: 23', values);
    try {
      const mutationResponse = await addUser({
        variables: {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        },
      });
      console.log('response data', data);
      const token = mutationResponse.data.addUser.token;
      Auth.login(token);
      setIsModalVisible(true); // Show modal upon successful submission
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="container my-1">
      <Link to="/login" className="ant-btn-secondary">
        ← Go to Login
      </Link>

      <Title level={2} className="title" style={{ color: '#ffffff' }}>
        Signup
      </Title>
      <Form
        name="signup"
        initialValues={{ remember: true }}
        onFinish={handleFormSubmit}
      >
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="First Name"
            name="firstName"
            value={formState.firstName}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Last Name"
            name="lastName"
            value={formState.lastName}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
            name="password"
            value={formState.password}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      {error && <div>Signup failed</div>}

      <Modal
        title="Success"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <img
          src="https://via.placeholder.com/400"
          alt="Success"
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
}

export default Signup;