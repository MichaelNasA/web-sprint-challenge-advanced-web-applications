import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
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
    setMessage('')
    setSpinnerOn(true)

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setMessage(data.message)
      redirectToArticles()
    } catch (error) {
      setMessage('Login failed')
    } finally {
      setSpinnerOn(false)
    }
  }

  const getArticles = async () => {
    setMessage('')
    setSpinnerOn(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(articlesUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          redirectToLogin()
        }
        throw new Error('Failed to fetch articles')
      }

      const data = await response.json()
      setArticles(data.articles)
      setMessage(data.message)
    } catch (error) {
      setMessage('Failed to fetch articles')
    } finally {
      setSpinnerOn(false)
    }
  }

  const postArticle = async article => {
    // Similar implementation to getArticles, but with POST request
  }

  const updateArticle = async ({ article_id, article }) => {
    // Implement updating an article
  }

  const deleteArticle = async article_id => {
    // Implement deleting an article
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
          <Route path="articles" element={
            <>
              <ArticleForm postArticle={postArticle} />
              <Articles articles={articles} />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
