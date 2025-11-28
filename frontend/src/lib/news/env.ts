// Environment variables utility for browser access
// This file should be imported in the main layout or page to expose env vars to window.env

export function exposeEnvVarsToBrowser() {
  // This function should be called on the server side to expose env vars to the browser
  // In Next.js, you would typically do this in getServerSideProps or getStaticProps
  // and pass the values to the client
}

// Get environment variables that have been exposed to the browser
export function getExposedEnvVars() {
  if (typeof window !== 'undefined') {
    return (window as any).env || {};
  }
  return {};
}