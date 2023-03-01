import { NextUIProvider } from '@nextui-org/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'
import ChatPage from './pages/chat'
import CursorPage from './pages/cursor'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
	{
		path: '/chat',
		element: <ChatPage />,
	},
	{
		path: '/cursor',
		element: <CursorPage />,
	},
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<NextUIProvider>
		<Toaster />
		<RouterProvider router={router} />
	</NextUIProvider>
)
