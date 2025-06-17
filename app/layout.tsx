
import AuthListener from "./components/AuthListener";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={""}>
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
