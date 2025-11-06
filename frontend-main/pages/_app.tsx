import '../styles/globals.css'
import type { AppProps } from 'next/app'
import FeedbackNotification from '../components/FeedbackNotification'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <FeedbackNotification onNewFeedback={() => {}} />
    </>
  )
}

