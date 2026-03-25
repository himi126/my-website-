import { appStorage } from './appStorage';

// 💡 关键修正：将全局变量名设为 storage，以匹配报错中提到的变量名
if (typeof window !== 'undefined') { 
  (window as any).storage = appStorage; 
  (window as any).appStorage = appStorage; // 保险起见，两个名字都挂载上
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
