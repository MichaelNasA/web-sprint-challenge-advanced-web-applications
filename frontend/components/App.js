import React, { useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from './Spinner';
import Message from './Message';
import LoginForm from './LoginForm';
import Articles from './Articles';
import ArticleForm from './ArticleForm';

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [spinnerOn, setSpinnerOn] = useState(false);
  const navigate = useNavigate();

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

  const login = ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);

    axios.post(loginUrl, { username, password })
      .then(response => {
        const { token, message: loginMessage } = response.data;
        localStorage.setItem('token', token);
        setMessage(loginMessage);
        redirectToArticles();
      })
      .catch(error => {
        setMessage('Login failed',error);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token');

    axios.get(articlesUrl, {
      headers: { Authorization: `${token}` },
    })
      .then(response => {
        const { articles: fetchedArticles, message: articlesMessage } = response.data;
        setArticles(fetchedArticles);
        setMessage(articlesMessage);
      })
      .catch(error => {
        setMessage('Failed to fetch articles');
        if (error.response && error.response.status === 401) {
          redirectToLogin();
        }
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const postArticle = (articleData) => {
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token');

    axios.post(articlesUrl, articleData, {
      headers: { Authorization: `${token}` },
    })
      .then(response => {
        const { message: postMessage } = response.data;
        setMessage(postMessage);
        redirectToArticles();
      })
      .catch(error => {
        setMessage('Failed to create article',error);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const updateArticle = (articleId, articleData) => {
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token');

    axios.put(`${articlesUrl}/${articleId}`, articleData, {
      headers: { Authorization: `${token}` },
    })
      .then(response => {
        const { message: updateMessage } = response.data;
        setMessage(updateMessage);
        redirectToArticles();
      })
      .catch(error => {
        setMessage('Failed to update article',error);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const deleteArticle = (articleId) => {
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token');

    axios.delete(`${articlesUrl}/${articleId}`, {
      headers: { Authorization: `${token}` },
    })
      .then(response => {
        const { message: deleteMessage } = response.data;
        setMessage(deleteMessage);
        getArticles(); // Refresh articles after deletion
      })
      .catch(error => {
        setMessage('Failed to delete article',error);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
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
          <Route path="/articles" element={<Articles articles={articles} getArticles={getArticles} deleteArticle={deleteArticle} setCurrentArticleId={setCurrentArticleId} />} />
          <Route path="/articles/new" element={<ArticleForm submitArticle={postArticle} />} />
          <Route path="/articles/edit/:id" element={<ArticleForm submitArticle={updateArticle} />} />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
