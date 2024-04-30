import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Articles from './Articles';
import LoginForm from './LoginForm';
import Message from './Message';
import ArticleForm from './ArticleForm';
import Spinner from './Spinner';

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState();
  const [spinnerOn, setSpinnerOn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getArticles();
    }
  }, []);

  const redirectToLogin = () => {
    navigate('/');
  };

  const redirectToArticles = () => {
    navigate('/articles');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  };

  const handleError = (error) => {
    console.error('Error:', error);
    setMessage(error.response ? error.response.data.message : 'An error occurred');
  };

  const login = async ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);

    try {
      const response = await axios.post(loginUrl, { username, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      setMessage(data.message);
      redirectToArticles();
    } catch (error) {
      setMessage('Login failed');
      handleError(error);
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
        headers: { Authorization: `${token}` },
      });
      const data = response.data;
      setArticles(data.articles);
      setMessage(data.message);
    } catch (error) {
      setMessage('Failed to fetch articles');
      handleError(error);
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
      const response = await axios.post(articlesUrl, article, {
        headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
      });
      const data = response.data;
      // Handle successful response, update state, show success message, etc.
      setMessage(data.message);
      getArticles(); // Refresh articles after posting new one
    } catch (error) {
      setMessage('Error posting article');
      handleError(error);
    }
  };

  const updateArticle = async ({ article_id, article }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${articlesUrl}/${article_id}`, article, {
        headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
      });
      const data = response.data;
      // Handle successful response, update state, show success message, etc.
      setMessage(data.message);
      getArticles(); // Refresh articles after updating
    } catch (error) {
      setMessage('Error updating article');
      handleError(error);
    }
  };

  // const deleteArticle = async (currentArticleId, setCurrentArticleId) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const deleteArticle = await axios.delete(`${currentArticleId}/${setCurrentArticleId}`, {
  //       headers: { Authorization: `${token}` },
  //     });
  //     // Handle successful response, update state, show success message, etc.
  //     setMessage(deleteArticle.data.message);
  //     getArticles(); // Refresh articles after deleting
  //   } catch (error) {
  //     setMessage('Error deleting article');
  //     handleError(error);
  //   }
  // };
  const deleteArticle = article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)
    axios.delete(`${articlesUrl}/${article_id}`, { headers: { Authorization: localStorage.getItem('token') } })
      .then(res => {
        setMessage(res.data.message)
        setArticles(articles => {
          return articles.filter(art => {
            return art.article_id != article_id
          })
        })
      })
      .catch(err => {
        setMessage(err?.response?.data?.message || 'Something bad happened')
        if (err.response.status == 401) {
          redirectToLogin()
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }
  

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
          <Route path="/create-article" element={<ArticleForm postArticle={postArticle} />} />
          <Route path="/edit-article/:id" element={<ArticleForm updateArticle={updateArticle} />} />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
