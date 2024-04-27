import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)
  const navigate = useNavigate()

  const redirectToLogin = () => {
    navigate('/')
  }

  const redirectToArticles = () => {
    navigate('/articles')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setMessage('Goodbye!')
    redirectToLogin()
  }

  const login = async ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
  
    try {
      const response = await axios.post(loginUrl, {
        username,
        password
      });
  
      const data = response.data;
      localStorage.setItem('token', data.token);
      setMessage(data.message);
      redirectToArticles();
    } catch (error) {
      setMessage('Login failed');
    } finally {
      setSpinnerOn(false);
    }
  };

  const getArticles = async () => {
    setMessage('');
    setSpinnerOn(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(articlesUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = response.data;
      setArticles(data.articles);
      setMessage(data.message);
    } catch (error) {
      setMessage('Failed to fetch articles');
      if (error.response && error.response.status === 401) {
        redirectToLogin();
      }
    } finally {
      setSpinnerOn(false);
    }
  };
  const postArticle = async (article) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:9000/api/articles', article, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = response.data;
      // Handle successful response, update state, show success message, etc.
    } catch (error) {
      console.error('Error posting article:', error);
      // Handle error, show error message, etc.
    }
  };
  
  const updateArticle = async ({ article_id, article }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:9000/api/articles/${article_id}`, article, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = response.data;
      // Handle successful response, update state, show success message, etc.
    } catch (error) {
      console.error('Error updating article:', error);
      // Handle error, show error message, etc.
    }
  };
  
  const deleteArticle = async (article_id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:9000/api/articles/${article_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Handle successful response, update state, show success message, etc.
    } catch (error) {
      console.error('Error deleting article:', error);
      // Handle error, show error message, etc.
    }
  };
  
  return (
    <>
      <Spinner spinnerOn={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="/articles" element={<Articles articles={articles} getArticles={getArticles} />} />
          <Route path="articles" element={
            <>
              <ArticleForm postArticle={postArticle} />
              <Articles articles={articles} getArticles={getArticles} />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
