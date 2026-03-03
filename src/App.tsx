import { AppLayout, Footer, Header } from "@corbinmurray/ui-components";
import { useEffect } from "react";

export function App() {
  const appName = "Template App";

  // Handle hash routing: scroll to the target section when the hash changes
  useEffect(() => {
    const scrollToHash = (hash: string) => {
      if (!hash) return;
      // rAF ensures the DOM has painted before we attempt to scroll
      requestAnimationFrame(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      });
    };

    // Scroll on initial load if a hash is already present
    scrollToHash(window.location.hash);

    // Re-run when the hash changes while on the page
    const handleHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const layoutHeader = <Header appName={appName} />;

  const layoutFooter = <Footer />;

  // AppLayout handles all the min-heights, flexbox math, and
  // compensating for the Header's exact fixed height so things don't hide!
  return (
    <AppLayout header={layoutHeader} footer={layoutFooter}>
      Template for {appName}
    </AppLayout>
  );
}

export default App;
