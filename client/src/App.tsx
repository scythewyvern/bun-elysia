import { eden } from '@elysiajs/eden'
import {
	Button,
	Col,
	Container,
	Input,
	Row,
	Spacer,
	Text,
	Textarea,
	useInput,
} from '@nextui-org/react'
import { EventHandler, FormEventHandler, SyntheticEvent, useState } from 'react'
import { toast } from 'sonner'
import { proxy, useSnapshot } from 'valtio'
import type { App } from '../../src'
import './App.css'
import { userStore, useUserStore } from './store/user'

// export const api = eden<App>(
// 	location.origin === 'http://localhost:5173'
// 		? 'http://localhost:3001'
// 		: location.origin
// )
export const api = eden<App>('https://bun-elysia.up.railway.app/')

interface Message {
	message: string
	username: string
	time: number
}

interface ChatStore {
	messages: Message[]
	chat?: ReturnType<typeof api['chat']['subscribe']>
	connect: ({ room, username }: { room: string; username: string }) => void
	send: (msg: string) => void
}

const chatStore = proxy<ChatStore>({
	chat: undefined,
	connect: ({ room, username }) => {
		chatStore.chat = api.chat
			.subscribe({
				$query: {
					room,
					username,
				},
			})
			.on('message', ws => {
				chatStore.messages.push(ws.data)
				console.log(ws.data)
			})
			.on('open', ws => console.log('open'))
			.on('close', ws => console.log('close'))
	},
	messages: [],
	send: msg => {
		chatStore.chat?.send(msg)
	},
})

const useChatStore = () => useSnapshot(chatStore)

const chat = userStore.user?.username
	? api.chat
			.subscribe({
				$query: {
					room: 'qwe',
					username: userStore.user?.username,
				},
			})
			.on('message', ws => {
				chatStore.messages.push(ws.data)

				if (userStore.user?.username !== ws.data.username) {
					toast(ws.data.message)
				}
			})
	: null

const chat2 = api.chat
	.subscribe({
		$query: {
			room: 'qwe2',
			username: userStore.user?.username || '',
		},
	})
	.on('message', ws => {
		chatStore.messages.push(ws.data)
		if (userStore.user?.username !== ws.data.username) {
			toast(ws.data.message)
		}
	})

const send = (body: string) => chat?.send(body)

const appWs = api.app.subscribe({
	$query: {
		username: 'qwe',
	},
})

function App() {
	const { value, reset, bindings } = useInput('')
	const { value: username, bindings: usernameBinds } = useInput('')
	const { messages, chat } = useChatStore()
	const { user, login, logout } = useUserStore()

	const handleSendMessage = (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!value) return

		send(value)
		reset()
	}

	if (!user?.username) {
		return (
			<div>
				<h1>Login</h1>
				<form onSubmit={() => login({ username })}>
					<Input placeholder="Username" {...usernameBinds} />
					<Button type="submit">Login</Button>
				</form>
			</div>
		)
	}

	return (
		<div className="App">
			<Container
				css={{ minHeight: '100vh', paddingBlock: 15 }}
				display="flex"
				direction="column"
				justify="space-between"
			>
				<h3>{user.username}</h3>
				<Col
					css={{
						overflowY: 'scroll',
						maxHeight: '80vh',
					}}
				>
					{messages.map(({ message, username, time }) => (
						<Row key={time} align="center">
							<h5 style={{ margin: 0 }}>[{username}]:</h5>
							<Spacer x={0.3} />
							<p>{message}</p>
						</Row>
					))}
				</Col>
				<form
					onSubmit={handleSendMessage}
					style={{ width: 300, margin: '0 auto' }}
				>
					<Input type="text" bordered width="100%" {...bindings} />
				</form>
			</Container>
		</div>
	)
}

export default App
