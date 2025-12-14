// app/layout.tsx
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Chameleon Dashboard',
  description: 'Malware Analysis Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="suppress-browser-extensions"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Function to detect and suppress browser extensions
              (function() {
                // Remove extension-added attributes
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target.nodeName === 'BODY' || target.nodeName === 'HTML') {
                        // Remove common extension-added attributes
                        const attrNames = Array.from(target.attributes).map(attr => attr.name);
                        attrNames.forEach(name => {
                          if (name.includes('bis_') || 
                              name.includes('__processed') || 
                              name.includes('extension') ||
                              name.startsWith('data-') && name.includes('ext')) {
                            target.removeAttribute(name);
                          }
                        });
                      }
                    }
                  });
                });
                
                // Start observing
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['class', 'style', 'id', 'data-*', 'bis_*', '__processed*']
                });
                
                // Clean up on page unload
                window.addEventListener('beforeunload', () => {
                  observer.disconnect();
                });
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}