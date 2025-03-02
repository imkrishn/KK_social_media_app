'use client'

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased overflow-clip`}
      >
        <Provider store={store}>
          <ThemeProvider>

            {children}

          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
