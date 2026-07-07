import { HashRouter } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css'
import ClickSpark from './components/reactbits/ClickSpark'
import Layout from './components/layout/Layout'
import Hero from './components/hero/Hero'
import Carousel from './components/carousel/Carousel'
import SkillMarquee from './components/shared/SkillMarquee'
import Work from './components/work/Work'
import Publications from './components/publications/Publications'
import About from './components/about/About'
import Contact from './components/contact/Contact'
import { useGitHubData } from './hooks/useGitHubData'

function App() {
  const { projects, user, loading, error } = useGitHubData()

  return (
    <HashRouter>
      <ClickSpark sparkColor="#ff3d00" sparkCount={6} duration={500}>
        <Layout>
          <Hero />
          <Carousel projects={projects} loading={loading} />
          <SkillMarquee />
          <Work projects={projects} loading={loading} />
          <Publications />
          <About projects={projects} user={user} loading={loading} error={error} />
          <Contact />
        </Layout>
      </ClickSpark>
    </HashRouter>
  )
}

export default App
