import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate} from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
import { axiosWithAuth } from '../axios'



export default function App() {

  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => {
    navigate('/');
  }
  const redirectToArticles = () => { navigate('/Articles') }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.clear();
    setMessage('GoodBye!');
    redirectToLogin();
  }

  const login = async ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage('');
    setSpinnerOn(true);
    const loginResponse = await axios.post('http://localhost:9000/api/login', { username, password });
    console.log(loginResponse.data)
    setSpinnerOn(false);
    setMessage(loginResponse.data.message);
    localStorage.setItem('token', loginResponse.data.token)
    redirectToArticles();
  }

  const getArticles = async () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!

    setMessage('');
    setSpinnerOn(true);
    const articleResponse = await axiosWithAuth().get('http://localhost:9000/api/articles')
    // console.log(articleResponse.data)
    setSpinnerOn(false)
    setArticles(articleResponse.data.articles)
    setMessage(articleResponse.data.message)
    


  }

  const postArticle = async article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setMessage('')
    setSpinnerOn(true)
    const postResponse = await axiosWithAuth().post('http://localhost:9000/api/articles', article)
    console.log(postResponse.data)
    setSpinnerOn('')
    setMessage(postResponse.data.message)
    setArticles([...articles, postResponse.data.article])
  }

  const updateArticle = async ({ article_id,article }) => {
    // ✨ implement
    // You got this!
    console.log(article_id)
    setSpinnerOn(true)
    setMessage('')
    const postResponse = await axiosWithAuth().put(`http://localhost:9000/api/articles/${article_id}`, article);
    setMessage(postResponse.data.message)
    
    setSpinnerOn(false)
    const copyresponse = [... articles]
    const findingId = copyresponse.findIndex((item) => item.article_id === article_id)
    copyresponse[findingId] = postResponse.data.article
    setArticles(copyresponse)
    setCurrentArticleId(null)
  }

  const deleteArticle = async article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)
    const deleteArticle = await axiosWithAuth().delete(`http://localhost:9000/api/articles/${article_id}`)
    setSpinnerOn(false)
    console.log(deleteArticle.data)
    const articlecopy= [...articles]
    const findarticle = articlecopy.findIndex((item) => item.article_id === article_id)
    articlecopy.splice(findarticle,1)
    setArticles(articlecopy)
    setMessage(deleteArticle.data.message)
  }


  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner spinnerOn={spinnerOn}/>
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm setCurrentArticleId={setCurrentArticleId}currentArticle={articles.find(art => art.article_id === currentArticleId)} updateArticle={updateArticle} postArticle={postArticle} />
              <Articles currentArticleId={currentArticleId} setCurrentArticleId={setCurrentArticleId} deleteArticle={deleteArticle} articles={articles} getArticles={getArticles} />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}